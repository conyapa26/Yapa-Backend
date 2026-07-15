import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

  

    @IsString()
    @MinLength(3)
    name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    rut: string;

    @IsString()
    @MinLength(5)
    address: string;


    @IsString()
    @MinLength(8)
    phone: string;



}



