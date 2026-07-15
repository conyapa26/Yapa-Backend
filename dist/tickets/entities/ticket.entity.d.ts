import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';
export declare class Ticket {
    id: number;
    ticketNumber: number;
    payment: Payment;
    user: User;
    raffle: Raffle;
    createdAt: Date;
}
