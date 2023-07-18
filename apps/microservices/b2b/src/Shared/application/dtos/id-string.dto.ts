import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class IdStringDto {
  @ApiProperty()
  @Transform(({ value }) => String(value))
  @IsString()
  email: string;
}
