import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, MinLength, ValidateNested } from 'class-validator';
import { IsEmailArray } from '../../../Shared/application/validations/is-email-array.validation';

export class CreateInvitationDto {
  @IsArray()
  @IsNotEmpty()
  @MinLength(1)
  @ValidateNested({ each: true })
  @IsEmailArray()
  addressees: string[];
}

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}
