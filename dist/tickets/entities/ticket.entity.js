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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ticket = void 0;
const typeorm_1 = require("typeorm");
const payment_entity_1 = require("../../payments/entities/payment.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const raffle_entity_1 = require("../../raffles/entities/raffle.entity");
let Ticket = class Ticket {
    id;
    ticketNumber;
    payment;
    user;
    raffle;
    createdAt;
};
exports.Ticket = Ticket;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Ticket.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ticket_number', nullable: true }),
    __metadata("design:type", Number)
], Ticket.prototype, "ticketNumber", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_entity_1.Payment, (payment) => payment.id),
    __metadata("design:type", payment_entity_1.Payment)
], Ticket.prototype, "payment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, (user) => user.id),
    __metadata("design:type", user_entity_1.User)
], Ticket.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => raffle_entity_1.Raffle, (raffle) => raffle.id),
    __metadata("design:type", raffle_entity_1.Raffle)
], Ticket.prototype, "raffle", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Ticket.prototype, "createdAt", void 0);
exports.Ticket = Ticket = __decorate([
    (0, typeorm_1.Entity)()
], Ticket);
//# sourceMappingURL=ticket.entity.js.map