import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateConnectionDto {
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

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {}
