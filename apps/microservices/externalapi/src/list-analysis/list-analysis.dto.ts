export interface ListAnalysisResponse {
  listId: string;
  status: 'Processing' | 'Completed' | 'Failed';
  errorsDetails: string[];
  resultUrl: string;
  creationDate: string;
  expirationDate: string;
}
