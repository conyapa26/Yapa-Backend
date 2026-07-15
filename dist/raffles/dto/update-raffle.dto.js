"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateRaffleDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_raffle_dto_1 = require("./create-raffle.dto");
class UpdateRaffleDto extends (0, mapped_types_1.PartialType)(create_raffle_dto_1.CreateRaffleDto) {
}
exports.UpdateRaffleDto = UpdateRaffleDto;
//# sourceMappingURL=update-raffle.dto.js.map