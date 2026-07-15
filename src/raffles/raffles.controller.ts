import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { AdminApiKeyGuard } from 'src/common/guards/admin-api-key.guard';

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  // Lectura: pública, la necesita el frontend (progreso del sorteo, etc).
  @Get()
  findAll() {
    return this.rafflesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.rafflesService.findOne(+id);
  }

  // Escritura: solo administradores (requiere header x-admin-api-key).
  @UseGuards(AdminApiKeyGuard)
  @Post()
  create(@Body() createRaffleDto: CreateRaffleDto) {
    return this.rafflesService.create(createRaffleDto);
  }

  @UseGuards(AdminApiKeyGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRaffleDto: UpdateRaffleDto) {
    return this.rafflesService.update(+id, updateRaffleDto);
  }

  @UseGuards(AdminApiKeyGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.rafflesService.remove(+id);
  }
}
