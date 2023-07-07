import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class IdNumericDto {
  @ApiProperty()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id: number;
}
