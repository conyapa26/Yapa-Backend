import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Raffle } from '../../raffles/entities/raffle.entity';

export enum PaymentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity()
@Unique(['provider', 'providerTxId'])
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  provider: string;

  @Column({ nullable: true })
  providerTxId: string;

  @Column({
    nullable: true,
    unique: true,
  })
  externalReference: string;

  @Column()
  ticketQuantity: number;

  @Column()
  amount: number;

  @Column()
  ticketPrice: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => User, (user) => user.payments)
  user: User;

  @ManyToOne(() => Raffle, (raffle) => raffle.payments)
  raffle: Raffle;

  @CreateDateColumn()
  createdAt: Date;
}