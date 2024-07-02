export const SYSTEM_DATABASE = 'db.default.sqlite';
export const CLIENT_DATABASE = 'db.sqlite';
export const CONNECTION_TYPE_MSSQL = 'mssql';
export const CONNECTION_TYPE_SQLITE = 'sqlite';
export const TEST_ENVIRONMENT = 'test';
export const AWS_DOWNLOADER_QUEUE_IDENTIFIER = 'list-analysis-generate-file-producer';
export const AWS_ANALYSIS_QUEUE_IDENTIFIER = 'list-analysis-end-consumer';

export const DELETE_LIST = 'deleteList';
export const GET_ANALYSIS_STATUS = 'getAnalysisStatus';
export const GENERATE_ANALYSIS = 'generateAnalysis';
export const GET_LIST_INFO = 'getListInfo';
export const GET_PAGINATED_LIST = 'getPaginatedLists';
export const PREPARE_UPLOAD = 'prepare_upload';
export const UPLOAD_NEW_LIST = 'upload_new';
export const LIST_ANALISYS_ENDPOINT_NAMES = {
  deleteList: DELETE_LIST,
  getAnalysisStatus: GET_ANALYSIS_STATUS,
  generateAnalysis: GENERATE_ANALYSIS,
  getListInfo: GET_LIST_INFO,
  getPaginatedLists: GET_PAGINATED_LIST,
  prepare_upload: PREPARE_UPLOAD,
  upload_new: UPLOAD_NEW_LIST,
};

export const ENDPOINT_ACTIVITY_TYPE_ID = 22;
