import { IsString, IsNotEmpty, IsNumber, IsPositive, IsDateString, IsOptional } from 'class-validator';

export class CreateRaffleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsDateString()
  drawDate: string;

  @IsNumber()
  @IsPositive()
  totalTickets: number;

  @IsOptional()
  @IsString()
  status?: string;
}
