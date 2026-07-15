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
exports.TicketsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const ticket_entity_1 = require("./entities/ticket.entity");
const typeorm_2 = require("typeorm");
let TicketsService = class TicketsService {
    ticketRepository;
    constructor(ticketRepository) {
        this.ticketRepository = ticketRepository;
    }
    async getTicketsSoldForRaffle(raffleId) {
        return this.ticketRepository.count({ where: { raffle: { id: raffleId } } });
    }
    async createTickets({ quantity, user, raffle, payment }) {
        const tickets = [];
        const lastTicket = await this.ticketRepository.findOne({
            where: { raffle: { id: raffle.id } },
            order: { ticketNumber: 'DESC' },
        });
        let nextNumber = lastTicket && lastTicket.ticketNumber ? lastTicket.ticketNumber + 1 : 1;
        for (let i = 0; i < quantity; i++) {
            tickets.push(this.ticketRepository.create({
                user,
                raffle,
                payment,
                ticketNumber: nextNumber,
            }));
            nextNumber++;
        }
        return this.ticketRepository.save(tickets);
    }
    async countTickets() {
        return this.ticketRepository.count();
    }
};
exports.TicketsService = TicketsService;
exports.TicketsService = TicketsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(ticket_entity_1.Ticket)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TicketsService);
//# sourceMappingURL=tickets.service.js.map