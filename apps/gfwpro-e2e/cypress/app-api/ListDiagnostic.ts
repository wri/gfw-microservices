import { datatCyIdFromSensitiveAreaName, datatCyIdFromRegionsName } from './ListLabels';

const viewTreeCoverLossForSensitiveArea = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromSensitiveAreaName[name]}"]`).click();
};

const viewTreeCoverLossForRegions = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromRegionsName[name]}"]`).click();
};

export { viewTreeCoverLossForSensitiveArea, viewTreeCoverLossForRegions };
