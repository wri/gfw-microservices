const listStatusDescriptions = [
  {
    id: 1,
    status_name: 'Pending',
    status_description: 'Entity has been created but not activated.',
  },
  {
    id: 2,
    status_name: 'Active',
    status_description: 'Entity that is active',
  },
  {
    id: 3,
    status_name: 'Inactive',
    status_description: 'Entity that is de-activated',
  },
  {
    id: 4,
    status_name: 'Draft',
    status_description: 'Entity that has been edited and is ready for analysis.',
  },
  {
    id: 5,
    status_name: 'Analyzing Diagnostic',
    status_description:
      'Entity that has been triggered for diagnostic analysis; dashboard is ready.',
  },
  {
    id: 6,
    status_name: 'Analyzing Dashboard',
    status_description:
      'Entity that has been triggered for dashboard analysis; diagnostic is ready.',
  },
];

const listStatus = {
  Pending: 1,
  Active: 2,
  Inactive: 3,
  Draft: 4,
  AnalyzingDiagnostic: 5,
  AnalyzingDashboard: 6,
}

module.exports = {
  listStatusDescriptions,
  listStatus
};
