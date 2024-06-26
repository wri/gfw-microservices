export const SYSTEM_DATABASE = 'db.default.sqlite';
export const CLIENT_DATABASE = 'db.sqlite';
export const CONNECTION_TYPE_MSSQL = 'mssql';
export const CONNECTION_TYPE_SQLITE = 'sqlite';
export const TEST_ENVIRONMENT = 'test';
export const AWS_DOWNLOADER_QUEUE_IDENTIFIER = 'list-analysis-generate-file-producer';
export const AWS_ANALYSIS_QUEUE_IDENTIFIER = 'list-analysis-end-consumer';

export const listStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
};
