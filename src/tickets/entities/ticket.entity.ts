import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  Column,
} from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';
import { User } from '../../users/entities/user.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ticket_number', nullable: true })
  ticketNumber: number;

  @ManyToOne(() => Payment, (payment) => payment.id)
  payment: Payment;

  @ManyToOne(() => User, (user) => user.id)
  user: User;

  @ManyToOne(() => Raffle, (raffle) => raffle.id)
  raffle: Raffle;

  @CreateDateColumn()
  createdAt: Date;
}