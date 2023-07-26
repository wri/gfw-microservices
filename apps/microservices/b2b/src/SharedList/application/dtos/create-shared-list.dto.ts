import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateSharedListDto {
  @IsNotEmpty()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  listId: number;

  @IsEmail()
  @IsNotEmpty()
  userEmail: string;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  orgTargetId: number;
}
