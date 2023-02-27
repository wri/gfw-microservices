"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateInvitationDto = exports.CreateInvitationDto = void 0;
const tslib_1 = require("tslib");
const mapped_types_1 = require("@nestjs/mapped-types");
const class_validator_1 = require("class-validator");
class CreateInvitationDto {
}
tslib_1.__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(1),
    tslib_1.__metadata("design:type", Array)
], CreateInvitationDto.prototype, "addressees", void 0);
exports.CreateInvitationDto = CreateInvitationDto;
class UpdateInvitationDto extends (0, mapped_types_1.PartialType)(CreateInvitationDto) {
}
exports.UpdateInvitationDto = UpdateInvitationDto;
//# sourceMappingURL=invitation.dto.js.map