import { IsEmail, IsNotEmpty,  IsInt } from 'class-validator';
import { field } from 'ts-object-to-model';
export class CreatePendingConnectionRequest {

    @IsEmail()
    @field({sourceName: 'sourceEmail'})
    sourceEmail: string = undefined;

    @IsEmail()
    @field({sourceName: 'targetEmail'})
    targetEmail: string = undefined;

    @IsNotEmpty()
    @field({sourceName: 'sourceOrganization'})
    sourceOrganization: number = undefined;

    @IsNotEmpty()
    @field({sourceName: 'targetOrganization'})
    targetOrganization: number = undefined;

    token?: string = undefined;

    id?: number = undefined;   
}

export class GetConnectionRequest {
  sourceOrganizationId?: number = undefined;

  targetOrganizationId?: number = undefined;

  id?: number = undefined;

  status?: string = undefined;
}

export class ChangeStatusPendingConnectionRequest {
  
  @IsNotEmpty()
  userEmail: string = undefined;
  
  @IsInt()
  @IsNotEmpty()
  organizationId: number = undefined;
  
  @IsInt()
  @IsNotEmpty()
  idPendingConnection: number = undefined;

  token?: string = undefined;
  
}

export class PendingConnection {
  id: number = undefined;

  @field({sourceName: 'confirm_date'})
  confirmDate?: Date = undefined;

  @field({sourceName: 'create_date'})
  createDate: Date = undefined;

  @field({sourceName: 'expiration_date'})
  expirationDate: number = undefined;

  @field({sourceName: 'id_source_user'})
  idSourceUser: number = undefined;

  @field({sourceName: 'id_confirm_user'})
  idConfirmUser?: number = undefined;

  @field({sourceName: 'id_target_user'})
  idTargetUser: number = undefined;

  @field({sourceName: 'id_source_organization'})
  idSourceOrganization: number = undefined;

  @field({sourceName: 'id_target_organization'})
  idTargetOrganization: number = undefined;

  @field({sourceName: 'id_status'})
  idStatus: number = undefined;

  token: string = undefined;
}

export class TrustedConnection {
  id: number = undefined;

  @field({sourceName: 'create_date'})
  createDate: Date = undefined;

  @field({sourceName: 'last_updated_date'})
  lastUpdateDate: Date = undefined;

  @field({sourceName: 'last_updated_user'})
  lastUpdateUser: number = undefined;

  @field({sourceName: 'id_source_organization'})
  idSourceOrganization: number = undefined;

  @field({sourceName: 'id_target_organization'})
  idTargetOrganization: number = undefined;

  @field({sourceName: 'id_status'})
  idStatus: number = undefined;
}

