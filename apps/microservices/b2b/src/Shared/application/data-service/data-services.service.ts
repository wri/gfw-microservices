import { ConnectionRepository } from '../../../Connection/domain/connection.repository';
import { InvitationRepository } from '../../../Invitation/domain/invitation.repository';
import { DataServices } from '../../domain/data-service';

export class DataServicesService implements DataServices {
  constructor(
    public connection: ConnectionRepository,
    public invitation: InvitationRepository,
  ) {}
}
