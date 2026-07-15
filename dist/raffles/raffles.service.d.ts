import { Repository } from 'typeorm';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
import { Raffle } from './entities/raffle.entity';
export declare class RafflesService {
    private raffleRepository;
    constructor(raffleRepository: Repository<Raffle>);
    create(createRaffleDto: CreateRaffleDto): Promise<Raffle>;
    findAll(): Promise<Raffle[]>;
    findOne(id: number): Promise<Raffle>;
    update(id: number, updateRaffleDto: UpdateRaffleDto): Promise<Raffle>;
    remove(id: number): Promise<Raffle>;
}
