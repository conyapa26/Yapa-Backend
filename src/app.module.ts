import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsModule } from './payments/payments.module';
import { UsersModule } from './users/users.module';
import { RafflesModule } from './raffles/raffles.module';
import { TicketsModule } from './tickets/tickets.module';



@Module({
  imports: [
    ConfigModule.forRoot(),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      // ⚠️ synchronize solo debe estar en true en desarrollo.
      // En producción puede alterar/borrar columnas o tablas sin control.
      // Usa migraciones de TypeORM para producción.
      synchronize: process.env.NODE_ENV !== 'production',
    }),


    PaymentsModule,

    UsersModule,

    RafflesModule,

    TicketsModule,

  ],
  controllers: [],
  providers: [],
})
export class AppModule { }


