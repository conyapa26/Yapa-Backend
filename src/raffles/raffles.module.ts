import { Module } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';

@Module({
  controllers: [RafflesController],
  providers: [RafflesService],
  imports: [
    TypeOrmModule.forFeature([ Raffle])
  ]
})
export class RafflesModule { }
