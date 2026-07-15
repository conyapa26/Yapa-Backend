import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(dto: CreatePaymentDto): Promise<{
        url: string | undefined;
        preferenceId: string | undefined;
    }>;
    webhook(body: any, xSignature: string, xRequestId: string, dataIdFromQuery: string): Promise<{
        received: boolean;
    }>;
    getStatus(externalReference: string): Promise<{
        found: boolean;
        status?: undefined;
        ticketQuantity?: undefined;
        amount?: undefined;
    } | {
        found: boolean;
        status: import("./entities/payment.entity").PaymentStatus;
        ticketQuantity: number;
        amount: number;
    }>;
}
