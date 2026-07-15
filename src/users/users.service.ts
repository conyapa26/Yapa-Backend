import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  async findOrCreate(createUserDto: CreateUserDto):Promise<User> {

    try {


      const { email } = createUserDto;

      let user = await this.userRepository.findOneBy({ email });

      if (!user) {
        user = this.userRepository.create(createUserDto);
        user = await this.userRepository.save(user);
      }

      return user;

    } catch (error) {
      // UNIQUE constraint (Postgres)
      if (error.code === '23505') {
        return (await this.userRepository.findOneBy({
          email: createUserDto.email,
        }))!;
      }

      throw error;
    }
  }



findAll() {
  return `This action returns all users`;
}

findOne(id: number) {
  return `This action returns a #${id} user`;
}

update(id: number, updateUserDto: UpdateUserDto) {
  return `This action updates a #${id} user`;
}

remove(id: number) {
  return `This action removes a #${id} user`;
}
}
