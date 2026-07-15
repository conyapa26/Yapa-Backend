import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ticket } from './entities/ticket.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  async getTicketsSoldForRaffle(raffleId: number): Promise<number> {
    return this.ticketRepository.count({ where: { raffle: { id: raffleId } } });
  }

  async createTickets({ quantity, user, raffle, payment }) {
    const tickets: Ticket[] = [];

    const lastTicket = await this.ticketRepository.findOne({
      where: { raffle: { id: raffle.id } },
      order: { ticketNumber: 'DESC' },
    });

    let nextNumber = lastTicket && lastTicket.ticketNumber ? lastTicket.ticketNumber + 1 : 1;

    for (let i = 0; i < quantity; i++) {
      tickets.push(
        this.ticketRepository.create({
          user,
          raffle,
          payment,
          ticketNumber: nextNumber,
        }),
      );
      nextNumber++;
    }

    return this.ticketRepository.save(tickets);
  }


  async countTickets() {
    return this.ticketRepository.count();
  }

}