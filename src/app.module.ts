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
      // ⚠️ synchronize crea/actualiza tablas automáticamente según las entidades.
      // Es seguro usarlo la primera vez que se despliega (base de datos vacía).
      // Una vez que la base de datos tenga datos reales, se recomienda apagarlo
      // (quitar DB_SYNC=true) y usar migraciones de TypeORM en su lugar.
      synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production',
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
