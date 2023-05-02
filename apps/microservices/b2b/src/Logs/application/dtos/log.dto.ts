import { IsIn, IsNotEmpty } from 'class-validator';

export enum ActivityType {
  ConnectionRequested = 28,
  ConnectionAccepted = 29,
  ConnectionRejected = 30,
  ConnectionResent = 31,
  ConnectionCancelled = 32,
}

export class LogActivityDto {
  @IsNotEmpty()
  userEmail: string;

  @IsIn(['28', '29', '30', '31', '32'])
  activityType: ActivityType;

  @IsNotEmpty()
  organizationTarget: number;

  @IsNotEmpty()
  description: string;
}
