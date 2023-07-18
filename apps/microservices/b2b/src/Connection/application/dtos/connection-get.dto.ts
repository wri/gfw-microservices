export class ConnectionGetDto {
  id: number;
  createDate: string;
  sourceOrganizationName: string;
  targetOrganizationName: string;
  sourceEmail: string;
  editedDate: string;
  editorEmail: string;
  status: string;
  description: string;
  idSourceOrganization: number;
  idTargetOrganization: number;
}
