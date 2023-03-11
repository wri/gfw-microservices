import { Injectable } from '@nestjs/common';
import { ConnectionRepository } from 'apps/microservices/b2b/src/Connection/domain/connection.repository';
import { InvitationRepository } from 'apps/microservices/b2b/src/Invitation/domain/invitation.repository';
import { DataServices } from '../../domain/data-service';

export class DataServicesService implements DataServices {
  constructor(
    public connection: ConnectionRepository,
    public invitation: InvitationRepository,
  ) {
    console.log("ENTRE!!!!", connection, invitation)
  }
}
