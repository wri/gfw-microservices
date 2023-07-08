export enum ConnectionStatus {
  pending = 'pending',
  accepted = 'accepted',
  rejected = 'rejected',
  cancelled = 'cancelled',
  expired = 'expired',
}
export class Connection {
  id: number;
  createDate: Date;
  sourceOrganization: string;
  targetOrganization: string;
  sourceEmail: string;
  editorEmail: string;
  editedDate: Date;
  status: ConnectionStatus;
  description: string;
}

export class ConnectionInvitation {
  sourceEmail: string;
  targetEmail: string;
  sourceOrganization: number;
  targetOrganization: number;
}
