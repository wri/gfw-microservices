import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsNotEmpty, MinLength } from 'class-validator';

export class CreateInvitationDto {
  @IsArray()
  @IsNotEmpty()
  @MinLength(1)
  addressees: string[];
}

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}
