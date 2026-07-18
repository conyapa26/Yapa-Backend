import { Controller, Post, Get, Delete, Body, Param, Headers, Query, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { AdminApiKeyGuard } from 'src/common/guards/admin-api-key.guard';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
  }

  // Descarga un CSV con todos los compradores y sus pagos (abrir en Excel).
  // Requiere header x-admin-api-key.
  @UseGuards(AdminApiKeyGuard)
  @Get('export/csv')
  async exportCsv(@Res() res: Response) {
    const csv = await this.paymentsService.exportPaymentsAsCsv();

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="compradores-${new Date().toISOString().slice(0, 10)}.csv"`,
    );

    res.send(csv);
  }

  // ⚠️ Borra TODOS los tickets, pagos y usuarios (deja las rifas intactas).
  // Requiere header x-admin-api-key. Pensado para limpiar pruebas.
  @UseGuards(AdminApiKeyGuard)
  @Post('wipe-test-data')
  async wipeTestData() {
    return this.paymentsService.wipeTestData();
  }

  @Post('webhook')
  async webhook(
    @Body() body: any,
    @Headers('x-signature') xSignature: string,
    @Headers('x-request-id') xRequestId: string,
    @Query('data.id') dataIdFromQuery: string,
  ) {
    return this.paymentsService.processWebhook(body, {
      xSignature,
      xRequestId,
      dataIdFromQuery,
    });
  }

  @Get('status/:externalReference')
  async getStatus(@Param('externalReference') externalReference: string) {
    return this.paymentsService.getPaymentStatus(externalReference);
  }

  // Muestra en el navegador el HTML real del correo de un pago existente
  // (no lo envía). Solo para revisar el diseño en desarrollo.
  // Requiere header x-admin-api-key.
  @UseGuards(AdminApiKeyGuard)
  @Get(':id/email-preview')
  async previewEmail(@Param('id') id: string, @Res() res: Response) {
    const html = await this.paymentsService.previewPaymentEmail(Number(id));

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  }

  // ⚠️ Borra tickets, pagos y el usuario de UN comprador específico (por email).
  // Pensado para limpiar una compra de prueba puntual sin afectar a otros
  // compradores reales. Requiere header x-admin-api-key.
  @UseGuards(AdminApiKeyGuard)
  @Delete('by-email/:email')
  async deleteByEmail(@Param('email') email: string) {
    return this.paymentsService.deletePurchaseByEmail(email);
  }
}
