import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend = new Resend(process.env.RESEND_API_KEY);

  async sendPaymentSuccessEmail(
    to: string,
    name: string,
    ticketNumbers: number[],
  ) {
    const { data, error } = await this.resend.emails.send({
      from: 'Conyapa <noreply@conyapa.cl>',
      to,
      subject: 'Pago exitoso - Conyapa',
      html: `
        <h1>¡Pago exitoso!</h1>
        <p>Hola ${name}, tu compra fue confirmada.</p>

        <h3>Números comprados:</h3>
        <ul>
          ${ticketNumbers.map(n => `<li>${n}</li>`).join('')}
        </ul>

        <p>Gracias por participar en Conyapa 🍀</p>
      `,

      attachments: [
        {
          filename: 'sticker.jpeg',
          path: 'https://conyapa.cl/sticker.jpeg',
        },
      ],

    });

    if (error) {
      console.error('Error interno de Resend:', error);
    }
  }
}
