export interface RequestPreSignedURLModel {
  key: string;
  contentType: string;
  replaceFile?: boolean;
}

export interface RequestSaveLargeListProcessModel {
  key: string;
  userId: number;
  list_id: number;
  listName: string;
  client_database: string;
}

export interface ResponsePreSignedURLModel {
  url: string;
  keyFile: string;
  fileS3Route: string;
}

export interface ResponseObjectPresignedURLModel {
  url: string;
}

export interface CreateListInsertResultModel {
  list_id: number;
  s3_location: string;
}

export interface RequestLargeListProcess {
  organization_id: number;
  list_id: number;
  path: string;
  template_type: string;
  user_id: number;
  startAnalysis: boolean;
}

export interface ResponseLargeListProcess {
  executionArn: string;
  startDate: string;
}

export interface RequestTriggerProcessLargeList {
  list_name: string;
  user_id: number;
  client_database: string;
}

export interface CopyOrMoveLargeListRequest {
  listId: number;
  selectedListLocationClasification: string;
  customAttributesNames: string[];
  userListNames: string[];
  action: string; // move or copy
  listType: string; // new or existing
  listName: string;
  targetList?: number;
  selectedLocations: number[];
  addType: string;
  activeTemplate: string;
  commodityType?: string;
  templateData: unknown;
  saveAsDraft: boolean;
  userId: number;
  clientDatabase: number;
  organizationId: number;
  gfwListId: number;
  allLocationsSelected: boolean;
  filters: any;
}
