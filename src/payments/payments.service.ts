import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';
import { randomUUID, createHmac } from 'crypto';
import {
  MercadoPagoConfig,
  Preference,
  Payment as MPPayment,
} from 'mercadopago';
import { TicketsService } from 'src/tickets/tickets.service';
import { EmailService } from 'src/email/email.service';

export interface MpWebhookHeaders {
  xSignature?: string;
  xRequestId?: string;
  dataIdFromQuery?: string;
}

@Injectable()
export class PaymentsService {

  private client: MercadoPagoConfig;
  private preference: Preference;
  private paymentApi: MPPayment;



  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,

    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly ticketsService: TicketsService,
    private usersService: UsersService,

    @InjectRepository(Raffle)
    private raffleRepo: Repository<Raffle>,

    private readonly emailService: EmailService,
  ) {


    this.client = new MercadoPagoConfig({
      accessToken: process.env.MP_ACCESS_TOKEN!,
    });

    this.preference = new Preference(this.client);
    this.paymentApi = new MPPayment(this.client);
  }

  async createPayment(dto: CreatePaymentDto) {
    try {

      const user = await this.usersService.findOrCreate(dto.user);
      const raffle = await this.raffleRepo.findOne({
        where: { id: dto.raffleId },
      });

      if (!raffle) {
        throw new NotFoundException(`Raffle #${dto.raffleId} not found`);
      }

      if (raffle.status !== 'active') {
        throw new Error(`Raffle #${dto.raffleId} is not active`);
      }

      const soldTickets = await this.ticketsService.getTicketsSoldForRaffle(raffle.id);
      if (soldTickets + dto.tickets > raffle.totalTickets) {
        throw new Error(`Not enough tickets available. Only ${Math.max(0, raffle.totalTickets - soldTickets)} left.`);
      }

      const externalReference = randomUUID();

      const amount = dto.tickets * raffle.price;

      // 🟡 1. Crear en BD como PENDING
      const payment = this.paymentRepository.create({
        user,
        raffle,
        externalReference,
        ticketQuantity: dto.tickets,
        ticketPrice: raffle.price,
        amount,
        provider: 'mercadopago',
        status: PaymentStatus.PENDING,
      });

      await this.paymentRepository.save(payment);

      const preference = await this.preference.create({
        body: {
          items: [
            {
              id: raffle.id.toString(),
              title: `Compra de ${dto.tickets} ticket(s) - ${raffle.title}`,
              quantity: 1,
              unit_price: amount,
              currency_id: 'CLP',
            },
          ],

          external_reference: externalReference,

          payer: {
            name: dto.user.name,
            email: dto.user.email,
            phone: {
              area_code: '',
              number: dto.user.phone,
            },
            identification: {
              type: 'RUT',
              number: dto.user.rut,
            },
          },

          back_urls: {
            success: `${process.env.FRONTEND_URL}/confirmacion`,
            failure: `${process.env.FRONTEND_URL}/error`,
            pending: `${process.env.FRONTEND_URL}/pendiente`,
          },

          notification_url:
            `${process.env.BACKEND_URL}/api/payments/webhook`,

          auto_return: 'approved',
        },
      });

      console.log('Preference creada:', {
        preferenceId: preference.id,
        externalReference,
        amount,
      });

      return {
        url: preference.init_point,
        preferenceId: preference.id,
      };

    } catch (error) {
      console.error('ERROR AL CREAR PAYMENT:', error);
      throw error;
    }
  }



  /**
   * Genera un CSV con todos los compradores y sus pagos, para descargar
   * desde el navegador y abrir en Excel/Google Sheets.
   */
  async exportPaymentsAsCsv(): Promise<string> {
    // Solo se exportan los pagos aprobados (compras confirmadas).
    const payments = await this.paymentRepository.find({
      where: { status: PaymentStatus.APPROVED },
      relations: ['user', 'raffle'],
      order: { createdAt: 'DESC' },
    });

    const headers = [
      'ID',
      'Fecha',
      'Nombre',
      'Email',
      'RUT',
      'Telefono',
      'Direccion',
      'Rifa',
      'Cantidad tickets',
      'Monto',
      'Estado',
      'Voucher',
    ];

    // Usamos ';' como separador (en vez de ',') porque Excel en español
    // reconoce automáticamente ';' como delimitador de columnas al abrir
    // el archivo con doble click, sin necesidad de "Texto en columnas".
    const DELIMITER = ';';

    const escapeCsv = (value: unknown): string => {
      const str = value === null || value === undefined ? '' : String(value);
      if (str.includes(DELIMITER) || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const rows = payments.map((p) =>
      [
        p.id,
        p.createdAt?.toISOString() ?? '',
        p.user?.name ?? '',
        p.user?.email ?? '',
        p.user?.rut ?? '',
        p.user?.phone ?? '',
        p.user?.address ?? '',
        p.raffle?.title ?? '',
        p.ticketQuantity,
        p.amount,
        p.status,
        // ="..." fuerza a Excel a tratarlo como texto y no como número
        // (si no, números largos como este se muestran en notación científica).
        p.providerTxId ? `="${p.providerTxId}"` : '',
      ]
        .map(escapeCsv)
        .join(DELIMITER),
    );

    // \uFEFF (BOM) al inicio para que Excel detecte bien los acentos (UTF-8).
    return '\uFEFF' + [headers.join(DELIMITER), ...rows].join('\n');
  }

  /**
   * ⚠️ Borra TODOS los tickets, pagos y usuarios (datos de prueba).
   * Las rifas (raffles) NO se tocan, para no tener que recrearlas.
   * Pensado para limpiar compras de prueba antes del lanzamiento real.
   */
  async wipeTestData() {
    const ticketsDeleted = await this.ticketRepository
      .createQueryBuilder()
      .delete()
      .execute();

    const paymentsDeleted = await this.paymentRepository
      .createQueryBuilder()
      .delete()
      .execute();

    const usersDeleted = await this.userRepository
      .createQueryBuilder()
      .delete()
      .execute();

    return {
      wiped: true,
      ticketsDeleted: ticketsDeleted.affected ?? 0,
      paymentsDeleted: paymentsDeleted.affected ?? 0,
      usersDeleted: usersDeleted.affected ?? 0,
    };
  }

  async getPaymentStatus(externalReference: string) {
    const payment = await this.paymentRepository.findOne({
      where: { externalReference },
    });

    if (!payment) {
      return { found: false };
    }

    return {
      found: true,
      status: payment.status,
      ticketQuantity: payment.ticketQuantity,
      amount: payment.amount,
    };
  }

  /**
   * Valida la firma que Mercado Pago envía en el header `x-signature`.
   * Documentación: https://www.mercadopago.cl/developers/es/docs/checkout-api/webhooks
   *
   * El manifest se arma como: "id:{data.id};request-id:{x-request-id};ts:{ts};"
   * y se firma con HMAC-SHA256 usando el secreto del webhook (MP_WEBHOOK_SECRET).
   */
  private isValidMpSignature(
    dataId: string,
    headers: MpWebhookHeaders,
  ): boolean {
    const secret = process.env.MP_WEBHOOK_SECRET;

    if (!secret) {
      console.warn(
        'MP_WEBHOOK_SECRET no configurada: no se está validando la firma del webhook',
      );
      return true;
    }

    const xSignature = headers.xSignature;
    const xRequestId = headers.xRequestId;

    if (!xSignature || !xRequestId) {
      return false;
    }

    const parts = xSignature.split(',').reduce((acc, part) => {
      const [key, value] = part.split('=');
      if (key && value) acc[key.trim()] = value.trim();
      return acc;
    }, {} as Record<string, string>);

    const ts = parts['ts'];
    const v1 = parts['v1'];

    console.log('DEBUG XSIGNATURE CRUDO:', {
      xSignatureCompleto: xSignature,
      xSignatureLength: xSignature.length,
      partsParseadas: parts,
      v1Length: v1?.length,
      tsLength: ts?.length,
    });

    if (!ts || !v1) {
      return false;
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    const expectedSignature = createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    console.log('DEBUG FIRMA WEBHOOK:', {
      dataIdRecibido: dataId,
      xRequestId,
      ts,
      manifest,
      v1Recibido: v1,
      expectedSignature,
      coinciden: expectedSignature === v1,
      secretLength: secret.length,
    });

    return expectedSignature === v1;
  }

  async processWebhook(body: any, headers: MpWebhookHeaders = {}) {
    try {

      console.log(
        'WEBHOOK MP:',
        JSON.stringify(body, null, 2),
      );

      if (body?.type !== 'payment') {
        return { received: true };
      }

      if (!body?.data?.id) {
        return { received: true };
      }

      const paymentId = body.data.id;

      console.log('DEBUG QUERY PARAM DATA.ID:', {
        dataIdFromQueryRecibido: headers.dataIdFromQuery,
        paymentIdDelBody: paymentId,
        sonIguales: headers.dataIdFromQuery === paymentId.toString(),
      });

      // Mercado Pago indica que el "data.id" usado para armar el manifest
      // de la firma debe tomarse del query param de la URL (?data.id=...),
      // no del body, ya que en algunos casos el formato puede diferir.
      const dataIdForSignature = headers.dataIdFromQuery || paymentId.toString();

      if (!this.isValidMpSignature(dataIdForSignature, headers)) {
        console.error('Firma de webhook inválida, se descarta la notificación');
        return { received: true };
      }

      const mpPayment = await this.paymentApi.get({
        id: paymentId,
      });

      console.log(
        'MP PAYMENT:',
        JSON.stringify(mpPayment, null, 2),
      );

      const externalReference =
        mpPayment.external_reference;

      if (!externalReference) {
        console.error(
          'No external_reference encontrado',
        );

        return { received: true };
      }

      const payment =
        await this.paymentRepository.findOne({
          where: {
            externalReference,
          },
          relations: ['user', 'raffle'],
        });

      if (!payment) {
        console.error(
          `Payment no encontrado: ${externalReference}`,
        );

        return { received: true };
      }

      payment.providerTxId = paymentId.toString();
      payment.metadata = mpPayment;

      if (mpPayment.status === 'rejected') {
        payment.status = PaymentStatus.REJECTED;

        await this.paymentRepository.save(payment);

        return { received: true };
      }

      if (mpPayment.status !== 'approved') {
        await this.paymentRepository.save(payment);

        return { received: true };
      }

      if (payment.status === PaymentStatus.APPROVED) {
        return { received: true };
      }

      payment.status = PaymentStatus.APPROVED;

      await this.paymentRepository.save(payment);

      const tickets =
        await this.ticketsService.createTickets({
          quantity: payment.ticketQuantity,
          user: payment.user,
          raffle: payment.raffle,
          payment,
        });

      try {
        await this.emailService.sendPaymentSuccessEmail(
          payment.user.email,
          payment.user.name,
          tickets.map((t) => t.ticketNumber),
          payment.providerTxId,
          payment.raffle.title,
          payment.raffle.drawDate,
          payment.amount,
        );
      } catch (emailError) {
        console.error(
          'Error enviando correo:',
          emailError,
        );
      }

      return { received: true };

    } catch (error) {
      console.error(
        'ERROR PROCESS WEBHOOK:',
        error,
      );

      return { received: true };
    }
  }

  // Arma el HTML real del correo de un pago existente, sin enviarlo.
  // Pensado solo para revisar el diseño en desarrollo.
  async previewPaymentEmail(paymentId: number): Promise<string> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'raffle'],
    });

    if (!payment) {
      throw new NotFoundException(`Payment ${paymentId} no encontrado`);
    }

    const tickets = await this.ticketRepository.find({
      where: { payment: { id: payment.id } },
    });

    return this.emailService.buildPaymentSuccessHtml(
      payment.user.name,
      tickets.map((t) => t.ticketNumber),
      payment.providerTxId,
      payment.raffle.title,
      payment.raffle.drawDate,
      payment.amount,
    );
  }

  // Borra SOLO los datos de un comprador específico (por email): sus tickets,
  // sus pagos y su usuario. Pensado para limpiar compras de prueba puntuales
  // sin afectar a otros compradores reales. Requiere header x-admin-api-key.
  async deletePurchaseByEmail(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    const ticketsDeleted = await this.ticketRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId: user.id })
      .execute();

    const paymentsDeleted = await this.paymentRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId', { userId: user.id })
      .execute();

    await this.userRepository.delete(user.id);

    return {
      wiped: true,
      email,
      ticketsDeleted: ticketsDeleted.affected ?? 0,
      paymentsDeleted: paymentsDeleted.affected ?? 0,
    };
  }

}
