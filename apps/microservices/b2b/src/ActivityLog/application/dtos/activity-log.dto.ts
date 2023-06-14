import { IsNotEmpty, IsNumber } from 'class-validator';
import { B2bStatus } from '@wri-monorepos/constants';

export class ActivityLogDto {
  @IsNotEmpty()
  userEmail: string;

  @IsNumber()
  @IsNotEmpty()
  activityType: B2bStatus;

  @IsNotEmpty()
  organizationTarget: number;

  @IsNotEmpty()
  description: string;
}
