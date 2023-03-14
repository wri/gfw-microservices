import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsNumber, MinLength } from 'class-validator';

export class CreateInvitationDto {
  /*@IsArray()
  @IsNotEmpty()
  @MinLength(1)
  @ValidateNested({ each: true })
  @IsEmailArray()
  addressees: string[];*/

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
