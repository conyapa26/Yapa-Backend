import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Repository } from 'typeorm';
import { UsersService } from 'src/users/users.service';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { TicketsService } from 'src/tickets/tickets.service';
import { EmailService } from 'src/email/email.service';
export interface MpWebhookHeaders {
    xSignature?: string;
    xRequestId?: string;
    dataIdFromQuery?: string;
}
export declare class PaymentsService {
    private paymentRepository;
    private readonly ticketsService;
    private usersService;
    private raffleRepo;
    private readonly emailService;
    private client;
    private preference;
    private paymentApi;
    constructor(paymentRepository: Repository<Payment>, ticketsService: TicketsService, usersService: UsersService, raffleRepo: Repository<Raffle>, emailService: EmailService);
    createPayment(dto: CreatePaymentDto): Promise<{
        url: string | undefined;
        preferenceId: string | undefined;
    }>;
    getPaymentStatus(externalReference: string): Promise<{
        found: boolean;
        status?: undefined;
        ticketQuantity?: undefined;
        amount?: undefined;
    } | {
        found: boolean;
        status: PaymentStatus;
        ticketQuantity: number;
        amount: number;
    }>;
    private isValidMpSignature;
    processWebhook(body: any, headers?: MpWebhookHeaders): Promise<{
        received: boolean;
    }>;
}
