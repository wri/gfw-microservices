export const listStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
};

export const listStatusOrderByWorse = [
  listStatus.Draft,
  listStatus.Inactive,
  listStatus.Pending,
  listStatus.AnalyzingDiagnostic,
  listStatus.AnalyzingDashboard,
  listStatus.Active,
];

export const listStatusDescriptions = [
  {
    id: listStatus.Pending,
    status_name: 'Pending',
    status_description: 'Entity has been created but not activated.',
  },
  {
    id: listStatus.Active,
    status_name: 'Active',
    status_description: 'Entity that is active',
  },
  {
    id: listStatus.Inactive,
    status_name: 'Inactive',
    status_description: 'Entity that is de-activated',
  },
  {
    id: listStatus.Draft,
    status_name: 'Draft',
    status_description: 'Entity that has been edited and is ready for analysis.',
  },
  {
    id: listStatus.AnalyzingDiagnostic,
    status_name: 'Analyzing Diagnostic',
    status_description:
      'Entity that has been triggered for diagnostic analysis; dashboard is ready.',
  },
  {
    id: listStatus.AnalyzingDashboard,
    status_name: 'Analyzing Dashboard',
    status_description:
      'Entity that has been triggered for dashboard analysis; diagnostic is ready.',
  },
];

export function getListStatusString(status: number): string {
  const listStatus = listStatusDescriptions.find((s) => s.id === status);
  return listStatus ? listStatus.status_name : 'Invalid Status';
}
