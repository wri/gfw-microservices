export interface ListUploadNewRequest {
  uploadId: string;
  listName: string;
  templateId: string;
  analysisIDs: string;
}

export interface ListUploadNewResponse {
  uploadId: string;
  listId: string;
  status: 'Processing' | 'Completed' | 'Failed';
  errorDetails: string;
  creationDate: string;
}

export interface ListUploadNewErrorResponse {
  errorDetails: string;
}
