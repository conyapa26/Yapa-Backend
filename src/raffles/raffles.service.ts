import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { Raffle } from './entities/raffle.entity';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
  ) {}

  create(createRaffleDto: CreateRaffleDto) {
    const raffle = this.raffleRepository.create({
      ...createRaffleDto,
      drawDate: new Date(createRaffleDto.drawDate),
    });
    return this.raffleRepository.save(raffle);
  }

  findAll() {
    return this.raffleRepository.find();
  }

  async findOne(id: number) {
    const raffle = await this.raffleRepository.findOne({ where: { id } });
    if (!raffle) {
      throw new NotFoundException(`Raffle #${id} not found`);
    }
    return raffle;
  }

  async update(id: number, updateRaffleDto: UpdateRaffleDto) {
    const raffle = await this.findOne(id);
    Object.assign(raffle, {
      ...updateRaffleDto,
      ...(updateRaffleDto.drawDate && { drawDate: new Date(updateRaffleDto.drawDate) }),
    });
    return this.raffleRepository.save(raffle);
  }

  async remove(id: number) {
    const raffle = await this.findOne(id);
    return this.raffleRepository.remove(raffle);
  }
}
