import { IsNotEmpty, IsNumber } from 'class-validator';
import { B2bStatus } from '../../../../../../../libs/constants/types/b2b-status';

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
