import { ConnectionRepository } from '../../Connection/domain/connection.repository';
import { InvitationRepository } from '../../Invitation/domain/invitation.repository';
export declare abstract class DataServices {
    abstract connection: ConnectionRepository;
    abstract invitation: InvitationRepository;
}
