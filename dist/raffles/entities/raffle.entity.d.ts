import { Payment } from '../../payments/entities/payment.entity';
export declare class Raffle {
    id: number;
    title: string;
    price: number;
    drawDate: Date;
    status: string;
    totalTickets: number;
    payments: Payment[];
}
