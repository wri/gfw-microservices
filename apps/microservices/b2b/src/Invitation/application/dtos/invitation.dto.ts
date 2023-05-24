import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInvitationDto {
  @IsEmail()
  @IsNotEmpty()
  sourceEmail: string;

  @IsEmail()
  @IsNotEmpty()
  targetEmail: string;

  @IsNotEmpty()
  @IsNumber()
  targetOrganization: number;

  @IsNotEmpty()
  @IsNumber()
  sourceOrganization: number;
}

export class UpdateInvitationDto extends PartialType(CreateInvitationDto) {}
