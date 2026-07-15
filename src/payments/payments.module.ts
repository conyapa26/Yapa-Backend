import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { RafflesModule } from 'src/raffles/raffles.module';
import { Raffle } from 'src/raffles/entities/raffle.entity';
import { UsersModule } from 'src/users/users.module';
import { TicketsModule } from 'src/tickets/tickets.module';
import { EmailModule } from 'src/email/email.module';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { User } from 'src/users/entities/user.entity';



@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [
    TypeOrmModule.forFeature([Payment, Raffle, Ticket, User]),
    RafflesModule,
    UsersModule,
    TicketsModule,
    EmailModule
  ]
})
export class PaymentsModule { }
