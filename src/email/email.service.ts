import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  buildPaymentSuccessHtml(
    name: string,
    ticketNumbers: number[],
    voucher: string,
    raffleTitle: string,
    amount: number,
  ): string {
    const logoUrl = process.env.LOGO_IMAGE_URL || 'https://conyapa.cl/logo.png';

    // Hitos de venta y sus premios. Debe mantenerse igual a lo que
    // muestra la web en app/components/Premios.tsx.
    const hitos = [
      {
        etapa: 'Hito 1: 5.000 tickets',
        premios: ['5 premios de $200.000'],
      },
      {
        etapa: 'Hito 2: 10.000 tickets',
        premios: [
          '4 premios de $500.000',
          'Curso Profesional de Soldadura (INDURA)',
        ],
      },
      {
        etapa: 'Hito 3: 15.000 tickets',
        premios: [
          '2 premios de $1.000.000',
          'Curso Profesional de Soldadura (INDURA)',
        ],
      },
      {
        etapa: 'Etapa final - Hito 4: 20.000 tickets',
        final: true,
        premios: [
          'Parcela Lote 59',
          'Kit Intermedio Plus',
          'Modelo Clásico L – 72 m²',
        ],
      },
    ];

    const hitosHtml = hitos
      .map(
        (hito) => `
          <div style="border: 1px solid ${hito.final ? '#bfdbfe' : '#e5e5e5'}; background: ${hito.final ? '#eff6ff' : '#ffffff'}; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px;">
            <div style="font-weight: bold; margin-bottom: 6px; color: ${hito.final ? '#1d4ed8' : '#111827'};">
              ${hito.final ? '🏁' : '🎯'} ${hito.etapa}
            </div>
            <ul style="margin: 0; padding-left: 20px;">
              ${hito.premios.map((p) => `<li>${p}</li>`).join('')}
            </ul>
          </div>
        `,
      )
      .join('');

    return `
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="${logoUrl}" alt="Conyapa" style="max-width: 180px; height: auto;" />
      </div>

      <h1>¡Hola ${name}, tu pago fue confirmado! 🎉</h1>
      <p>Ya estás participando en <strong>${raffleTitle}</strong>. Mucha suerte, ¡ojalá te ganes el premio! 🍀</p>

      <h3>Tus números:</h3>
      <p>Tu número de voucher es: <strong>${voucher}</strong></p>
      <ul style="list-style: none; padding: 0;">
        ${ticketNumbers.map(n => `
          <li style="border: 1px solid #e5e5e5; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px;">
            <strong>${voucher}-${n}</strong>
          </li>
        `).join('')}
      </ul>

      <p><strong>Monto pagado:</strong> $${amount.toLocaleString('es-CL')}</p>

      <h3>🎁 Recuerda las yapas en cada hito de venta:</h3>
      ${hitosHtml}

      <p>Gracias por confiar en Conyapa. Te avisaremos apenas se realice el sorteo 🙌</p>
    `;
  }

  async sendPaymentSuccessEmail(
    to: string,
    name: string,
    ticketNumbers: number[],
    voucher: string,
    raffleTitle: string,
    amount: number,
  ) {
    const fromAddress = process.env.EMAIL_FROM || 'Conyapa <onboarding@resend.dev>';
    const stickerUrl = process.env.STICKER_IMAGE_URL;

    const html = this.buildPaymentSuccessHtml(
      name,
      ticketNumbers,
      voucher,
      raffleTitle,
      amount,
    );

    const { data, error } = await this.resend.emails.send({
      from: fromAddress,
      to,
      subject: `¡${name}, tu compra para "${raffleTitle}" fue exitosa! 🎟️`,
      html,

      ...(stickerUrl
        ? {
            attachments: [
              {
                filename: 'sticker.jpeg',
                path: stickerUrl,
              },
            ],
          }
        : {}),

    });

    if (error) {
      console.error('Error interno de Resend:', error);
    }
  }
}
