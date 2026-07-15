import { RafflesService } from './raffles.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';
import { UpdateRaffleDto } from './dto/update-raffle.dto';
export declare class RafflesController {
    private readonly rafflesService;
    constructor(rafflesService: RafflesService);
    findAll(): Promise<import("./entities/raffle.entity").Raffle[]>;
    findOne(id: string): Promise<import("./entities/raffle.entity").Raffle>;
    create(createRaffleDto: CreateRaffleDto): Promise<import("./entities/raffle.entity").Raffle>;
    update(id: string, updateRaffleDto: UpdateRaffleDto): Promise<import("./entities/raffle.entity").Raffle>;
    remove(id: string): Promise<import("./entities/raffle.entity").Raffle>;
}
