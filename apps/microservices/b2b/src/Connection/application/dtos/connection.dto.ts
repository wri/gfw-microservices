import { PartialType } from '@nestjs/mapped-types';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateConnectionDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'source@email.com',
    description:
      'This is the email of the organization that is sending the invitation.',
  })
  sourceEmail: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    example: 'target@email.com',
    description:
      'This is the email of the organization that is going to receive the invitation.',
  })
  targetEmail: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 123,
    description:
      'Numeric value for the organization that is going to receive the invitation.',
  })
  targetOrganization: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 123,
    description:
      'Numeric value for the organization that is going to send the invitation.',
  })
  sourceOrganization: number;
}

export class UpdateConnectionDto extends PartialType(CreateConnectionDto) {}
