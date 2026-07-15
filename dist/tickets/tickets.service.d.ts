import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';
export declare class TicketsService {
    private readonly ticketRepository;
    constructor(ticketRepository: Repository<Ticket>);
    getTicketsSoldForRaffle(raffleId: number): Promise<number>;
    createTickets({ quantity, user, raffle, payment }: {
        quantity: any;
        user: any;
        raffle: any;
        payment: any;
    }): Promise<Ticket[]>;
    countTickets(): Promise<number>;
}
