import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity';

@Entity()
export class Raffle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column({ type: 'timestamp', name: 'draw_date' })
  drawDate: Date;

  @Column({ default: 'active' })
  status: string;

  @Column({ name: 'total_tickets', default: 100 })
  totalTickets: number;

  @OneToMany(() => Payment, payment => payment.raffle)
  payments: Payment[];
}
