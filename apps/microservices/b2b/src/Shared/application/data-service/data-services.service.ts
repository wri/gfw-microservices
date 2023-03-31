import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from 'apps/microservices/b2b/src/Connection/domain/connection.repository';
import { InvitationRepository } from 'apps/microservices/b2b/src/Invitation/domain/invitation.repository';
import { ConnectionRepositoryMysql } from '../../../Connection/infrastructure/connection.repository.mysql';
import { InvitationRepositoryMysql } from '../../../Invitation/infrastructure/invitation.repository.mysql';
import { DataServices } from '../../domain/data-service';
import { MySqlDataServicesModule } from '../../infraestructure/mysql/mysql.data-service.module';

export class DataServicesService implements DataServices {
  constructor(
    public connection: ConnectionRepository,
    public invitation: InvitationRepository,
  ) {}
}
