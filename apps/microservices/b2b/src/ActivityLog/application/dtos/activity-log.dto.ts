import { IsNotEmpty, IsNumber } from 'class-validator';

export class ActivityLogDto {
  @IsNotEmpty()
  userEmail: string;

  @IsNumber()
  @IsNotEmpty()
  activityType: number;

  @IsNotEmpty()
  organizationTarget: number;

  @IsNotEmpty()
  description: string;
}
