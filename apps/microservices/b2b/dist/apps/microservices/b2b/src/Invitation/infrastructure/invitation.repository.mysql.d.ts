import { InvitationRepository } from 'src/Invitation/domain/invitation.repository';
import { Invitation } from 'src/Invitation/domain/invitation';
import { RepositoryMysql } from '../../Shared/infraestructure/mysql/repository.mysql';
export declare class InvitationRepositoryMysql extends RepositoryMysql implements InvitationRepository {
    resendInvitation(id: string): Promise<void>;
    createInvitation(invitation: Invitation): Promise<void>;
}
