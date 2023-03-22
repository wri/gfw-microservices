import { Transform } from 'class-transformer';
import { IsNumber } from 'class-validator';

export class IdNumericDto {
  @Transform(({ value }) => Number(value))
  @IsNumber()
  id: number;
}
