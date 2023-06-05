import { IsEmail, IsEnum, IsNumber } from 'class-validator';
import { ConnectionStatus } from '../../domain/connection';

export class ConnectionChangeDto {
  @IsEmail()
  editEmail: string;

  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;

  @IsNumber()
  id: number;
}

export class ConnectionAcceptHttpDto {
  @IsEmail()
  editEmail: string;
}
