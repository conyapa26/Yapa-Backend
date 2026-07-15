import { Controller, Post, Get, Body, Param, Headers, Query, Res, UseGuards } from '@nestjs/common';
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
}
