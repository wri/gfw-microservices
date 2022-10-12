import { IsEmail, IsNotEmpty } from 'class-validator';

export class PendingConnection {

    @IsEmail()
    sourceEmail: string = undefined;

    @IsEmail()
    targetEmail: string = undefined;

    @IsNotEmpty()
    sourceOrganization: number = undefined;

    @IsNotEmpty()
    targetOrganization: number = undefined;

    token?: string = undefined;

    id?: number = undefined;
  }