import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Payment } from '../../payments/entities/payment.entity'

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  rut: string;

  @Column({ nullable: false })
  address: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  phone: string;

  @OneToMany(() => Payment, payment => payment.user)
  payments: Payment[];

}
