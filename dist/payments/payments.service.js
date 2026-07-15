"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const payment_entity_1 = require("./entities/payment.entity");
const typeorm_2 = require("typeorm");
const users_service_1 = require("../users/users.service");
const raffle_entity_1 = require("../raffles/entities/raffle.entity");
const crypto_1 = require("crypto");
const mercadopago_1 = require("mercadopago");
const tickets_service_1 = require("../tickets/tickets.service");
const email_service_1 = require("../email/email.service");
let PaymentsService = class PaymentsService {
    paymentRepository;
    ticketsService;
    usersService;
    raffleRepo;
    emailService;
    client;
    preference;
    paymentApi;
    constructor(paymentRepository, ticketsService, usersService, raffleRepo, emailService) {
        this.paymentRepository = paymentRepository;
        this.ticketsService = ticketsService;
        this.usersService = usersService;
        this.raffleRepo = raffleRepo;
        this.emailService = emailService;
        this.client = new mercadopago_1.MercadoPagoConfig({
            accessToken: process.env.MP_ACCESS_TOKEN,
        });
        this.preference = new mercadopago_1.Preference(this.client);
        this.paymentApi = new mercadopago_1.Payment(this.client);
    }
    async createPayment(dto) {
        try {
            const user = await this.usersService.findOrCreate(dto.user);
            const raffle = await this.raffleRepo.findOne({
                where: { id: dto.raffleId },
            });
            if (!raffle) {
                throw new common_1.NotFoundException(`Raffle #${dto.raffleId} not found`);
            }
            if (raffle.status !== 'active') {
                throw new Error(`Raffle #${dto.raffleId} is not active`);
            }
            const soldTickets = await this.ticketsService.getTicketsSoldForRaffle(raffle.id);
            if (soldTickets + dto.tickets > raffle.totalTickets) {
                throw new Error(`Not enough tickets available. Only ${Math.max(0, raffle.totalTickets - soldTickets)} left.`);
            }
            const externalReference = (0, crypto_1.randomUUID)();
            const amount = dto.tickets * raffle.price;
            const payment = this.paymentRepository.create({
                user,
                raffle,
                externalReference,
                ticketQuantity: dto.tickets,
                ticketPrice: raffle.price,
                amount,
                provider: 'mercadopago',
                status: payment_entity_1.PaymentStatus.PENDING,
            });
            await this.paymentRepository.save(payment);
            const preference = await this.preference.create({
                body: {
                    items: [
                        {
                            id: raffle.id.toString(),
                            title: `Compra de ${dto.tickets} ticket(s)`,
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
                    notification_url: `${process.env.BACKEND_URL}/api/payments/webhook`,
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
        }
        catch (error) {
            console.error('ERROR AL CREAR PAYMENT:', error);
            throw error;
        }
    }
    async getPaymentStatus(externalReference) {
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
    isValidMpSignature(dataId, headers) {
        const secret = process.env.MP_WEBHOOK_SECRET;
        if (!secret) {
            console.warn('MP_WEBHOOK_SECRET no configurada: no se está validando la firma del webhook');
            return true;
        }
        const xSignature = headers.xSignature;
        const xRequestId = headers.xRequestId;
        if (!xSignature || !xRequestId) {
            return false;
        }
        const parts = xSignature.split(',').reduce((acc, part) => {
            const [key, value] = part.split('=');
            if (key && value)
                acc[key.trim()] = value.trim();
            return acc;
        }, {});
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
        const expectedSignature = (0, crypto_1.createHmac)('sha256', secret)
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
    async processWebhook(body, headers = {}) {
        try {
            console.log('WEBHOOK MP:', JSON.stringify(body, null, 2));
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
            const dataIdForSignature = headers.dataIdFromQuery || paymentId.toString();
            if (!this.isValidMpSignature(dataIdForSignature, headers)) {
                console.error('Firma de webhook inválida, se descarta la notificación');
                return { received: true };
            }
            const mpPayment = await this.paymentApi.get({
                id: paymentId,
            });
            console.log('MP PAYMENT:', JSON.stringify(mpPayment, null, 2));
            const externalReference = mpPayment.external_reference;
            if (!externalReference) {
                console.error('No external_reference encontrado');
                return { received: true };
            }
            const payment = await this.paymentRepository.findOne({
                where: {
                    externalReference,
                },
                relations: ['user', 'raffle'],
            });
            if (!payment) {
                console.error(`Payment no encontrado: ${externalReference}`);
                return { received: true };
            }
            payment.providerTxId = paymentId.toString();
            payment.metadata = mpPayment;
            if (mpPayment.status === 'rejected') {
                payment.status = payment_entity_1.PaymentStatus.REJECTED;
                await this.paymentRepository.save(payment);
                return { received: true };
            }
            if (mpPayment.status !== 'approved') {
                await this.paymentRepository.save(payment);
                return { received: true };
            }
            if (payment.status === payment_entity_1.PaymentStatus.APPROVED) {
                return { received: true };
            }
            payment.status = payment_entity_1.PaymentStatus.APPROVED;
            await this.paymentRepository.save(payment);
            const tickets = await this.ticketsService.createTickets({
                quantity: payment.ticketQuantity,
                user: payment.user,
                raffle: payment.raffle,
                payment,
            });
            try {
                await this.emailService.sendPaymentSuccessEmail(payment.user.email, payment.user.name, tickets.map((t) => t.id));
            }
            catch (emailError) {
                console.error('Error enviando correo:', emailError);
            }
            return { received: true };
        }
        catch (error) {
            console.error('ERROR PROCESS WEBHOOK:', error);
            return { received: true };
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(3, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        tickets_service_1.TicketsService,
        users_service_1.UsersService,
        typeorm_2.Repository,
        email_service_1.EmailService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map