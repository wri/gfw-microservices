const datatCyIdFromSensitiveAreaName = {
  'Primary Forest': 'primary-forest',
  'Protected Areas': 'protected-areas',
  Peat: 'peat',
  'Intact Forest Landscape': 'intact-forest-landscape',
};

const viewTreeCoverLossForSensitiveArea = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromSensitiveAreaName[name]}"]`).click();
};

export { viewTreeCoverLossForSensitiveArea };
