import { datatCyIdFromSensitiveAreaName, datatCyIdFromRegionsOptionsName } from './ListLabels';

const viewTreeCoverLossForSensitiveArea = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromSensitiveAreaName[name]}"]`).click();
};

const viewTreeCoverLossForRegions = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromRegionsOptionsName[name]}"] label`).click();
};

export { viewTreeCoverLossForSensitiveArea, viewTreeCoverLossForRegions };
