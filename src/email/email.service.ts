import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPaymentSuccessEmail(
    to: string,
    name: string,
    ticketNumbers: number[],
    voucher: string,
  ) {
    const fromAddress = process.env.EMAIL_FROM || 'Conyapa <onboarding@resend.dev>';
    const stickerUrl = process.env.STICKER_IMAGE_URL;

    const { data, error } = await this.resend.emails.send({
      from: fromAddress,
      to,
      subject: 'Pago exitoso - Conyapa',
      html: `
        <h1>¡Pago exitoso!</h1>
        <p>Hola ${name}, tu compra fue confirmada.</p>

        <p><strong>N° de voucher:</strong> ${voucher}</p>

        <h3>Números comprados:</h3>
        <ul>
          ${ticketNumbers.map(n => `<li>${n}</li>`).join('')}
        </ul>

        <p>Gracias por participar en Conyapa 🍀</p>
      `,

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
