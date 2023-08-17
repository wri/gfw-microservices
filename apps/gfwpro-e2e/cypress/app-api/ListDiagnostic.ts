import { datatCyIdFromSensitiveAreaName, datatCyIdFromRegionsOptionsName } from './ListLabels';
import { listIdFromListName } from './List';

const viewTreeCoverLossForSensitiveArea = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromSensitiveAreaName[name]}"]`).click();
};

const viewTreeCoverLossForRegions = (name: string) => {
  cy.get(`[data-cy="${datatCyIdFromRegionsOptionsName[name]}"] label`).click();
};

const downloadListData = (list: string) => {
  const id = listIdFromListName[list];
  const url = `/locations/csv/${id}?type=everything&order=asc&listFilterStr=&aggregate=true&listView=forest_change&analysisAreaMin=0&selectedLocations=`;
  cy.intercept('GET', url, (req) => {
    req.reply({
      statusCode: 200,
      body: '',
      headers: {},
    });
  }).then(() => {
    cy.get('[data-cy="download-diagnostics"]').click();
  });
};

const changeDateFilter = () => {
  cy.get('[data-cy="diagnotcs-regions"] .irs-slider.from').click({ multiple: true, force: true });
  cy.get('[data-cy="diagnotcs-regions"] .irs-slider.from').type('{rightarrow}{rightarrow}');
};

export {
  viewTreeCoverLossForSensitiveArea,
  viewTreeCoverLossForRegions,
  changeDateFilter,
  downloadListData,
};
