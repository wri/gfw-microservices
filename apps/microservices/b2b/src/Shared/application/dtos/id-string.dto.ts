import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class IdStringDto {
  @Transform(({ value }) => String(value))
  @IsString()
  id: string;
}
