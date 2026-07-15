"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RafflesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const raffle_entity_1 = require("./entities/raffle.entity");
let RafflesService = class RafflesService {
    raffleRepository;
    constructor(raffleRepository) {
        this.raffleRepository = raffleRepository;
    }
    create(createRaffleDto) {
        const raffle = this.raffleRepository.create({
            ...createRaffleDto,
            drawDate: new Date(createRaffleDto.drawDate),
        });
        return this.raffleRepository.save(raffle);
    }
    findAll() {
        return this.raffleRepository.find();
    }
    async findOne(id) {
        const raffle = await this.raffleRepository.findOne({ where: { id } });
        if (!raffle) {
            throw new common_1.NotFoundException(`Raffle #${id} not found`);
        }
        return raffle;
    }
    async update(id, updateRaffleDto) {
        const raffle = await this.findOne(id);
        Object.assign(raffle, {
            ...updateRaffleDto,
            ...(updateRaffleDto.drawDate && { drawDate: new Date(updateRaffleDto.drawDate) }),
        });
        return this.raffleRepository.save(raffle);
    }
    async remove(id) {
        const raffle = await this.findOne(id);
        return this.raffleRepository.remove(raffle);
    }
};
exports.RafflesService = RafflesService;
exports.RafflesService = RafflesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(raffle_entity_1.Raffle)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], RafflesService);
//# sourceMappingURL=raffles.service.js.map