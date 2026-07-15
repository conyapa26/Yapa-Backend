import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  ValidateNested,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsString()
  @MinLength(8)
  rut: string;

  @IsString()
  @MinLength(5)
  address: string;

  @IsNotEmpty()
  @IsString()
  phone: string;
}

export class CreatePaymentDto {
  @ValidateNested()
  @Type(() => CreateUserDto)
  user: CreateUserDto;

  @IsInt()
  @Min(1)
  raffleId: number;


  @IsInt()
  @Min(1)
  tickets: number;



}