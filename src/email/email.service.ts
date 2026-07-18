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
    return `
      <h1>¡Hola ${name}, tu pago fue confirmado! 🎉</h1>
      <p>Ya estás participando en <strong>${raffleTitle}</strong>. Mucha suerte, ¡ojalá te ganes el premio! 🍀</p>

      <h3>Tus números:</h3>
      <ul>
        ${ticketNumbers.map(n => `<li>${voucher} - ${n}</li>`).join('')}
      </ul>

      <p><strong>Monto pagado:</strong> $${amount.toLocaleString('es-CL')}</p>
      <p><strong>N° de voucher:</strong> ${voucher}</p>

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
