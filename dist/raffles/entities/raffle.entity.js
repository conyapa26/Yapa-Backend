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
exports.Raffle = void 0;
const typeorm_1 = require("typeorm");
const payment_entity_1 = require("../../payments/entities/payment.entity");
let Raffle = class Raffle {
    id;
    title;
    price;
    drawDate;
    status;
    totalTickets;
    payments;
};
exports.Raffle = Raffle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Raffle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Raffle.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Raffle.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', name: 'draw_date' }),
    __metadata("design:type", Date)
], Raffle.prototype, "drawDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'active' }),
    __metadata("design:type", String)
], Raffle.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_tickets', default: 100 }),
    __metadata("design:type", Number)
], Raffle.prototype, "totalTickets", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_entity_1.Payment, payment => payment.raffle),
    __metadata("design:type", Array)
], Raffle.prototype, "payments", void 0);
exports.Raffle = Raffle = __decorate([
    (0, typeorm_1.Entity)()
], Raffle);
//# sourceMappingURL=raffle.entity.js.map