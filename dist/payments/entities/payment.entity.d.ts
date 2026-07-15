import { User } from '../../users/entities/user.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';
export declare enum PaymentStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class Payment {
    id: number;
    provider: string;
    providerTxId: string;
    externalReference: string;
    ticketQuantity: number;
    amount: number;
    ticketPrice: number;
    status: PaymentStatus;
    metadata: any;
    user: User;
    raffle: Raffle;
    createdAt: Date;
}
