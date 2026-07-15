import { Controller, Post, Get, Body, Param, Headers, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post()
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentsService.createPayment(dto);
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
