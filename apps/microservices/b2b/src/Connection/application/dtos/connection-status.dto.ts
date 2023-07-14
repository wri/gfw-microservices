import { IsEmail, IsEnum, IsNumber } from 'class-validator';
import { ConnectionStatus } from '../../domain/connection';
import { ApiProperty } from '@nestjs/swagger';
export class ConnectionChangeDto {
  @IsEmail()
  editEmail: string;

  @IsEnum(ConnectionStatus)
  status: ConnectionStatus;

  @IsNumber()
  id: number;
}

export class ConnectionUpdateStatusHttpDto {
  @ApiProperty({
    example: 'target@email.com',
    description: 'Email target or email source',
  })
  @IsEmail()
  editEmail: string;
}
