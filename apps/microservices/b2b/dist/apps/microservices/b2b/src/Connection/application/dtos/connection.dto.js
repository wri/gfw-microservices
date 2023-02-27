"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateConnectionDto = exports.CreateConnectionDto = exports.ConnectionMembersDto = void 0;
const tslib_1 = require("tslib");
const class_validator_1 = require("class-validator");
const mapped_types_1 = require("@nestjs/mapped-types");
const class_transformer_1 = require("class-transformer");
class ConnectionMembersDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], ConnectionMembersDto.prototype, "memeberName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], ConnectionMembersDto.prototype, "listId", void 0);
exports.ConnectionMembersDto = ConnectionMembersDto;
class CreateConnectionDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    tslib_1.__metadata("design:type", String)
], CreateConnectionDto.prototype, "connectionName", void 0);
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ConnectionMembersDto),
    (0, class_validator_1.MinLength)(2),
    tslib_1.__metadata("design:type", Array)
], CreateConnectionDto.prototype, "connectionList", void 0);
exports.CreateConnectionDto = CreateConnectionDto;
class UpdateConnectionDto extends (0, mapped_types_1.PartialType)(CreateConnectionDto) {
}
exports.UpdateConnectionDto = UpdateConnectionDto;
//# sourceMappingURL=connection.dto.js.map