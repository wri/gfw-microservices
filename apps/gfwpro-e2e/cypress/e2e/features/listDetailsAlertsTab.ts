import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

const SBTN_NATURAL_LANDS_OPTION = 'SBTN Natural Lands';
const JRC_GLOBAL_FOREST_OPTION = 'JRC Global Forest Cover';

describe('List Details - Alerts Tab', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page with alerts analysis', () => {
    cy.request({ url: '/api/locations', failOnStatusCode: false }).then((response) => {
      expect(response.status, 'locations API status').to.eq(200);

      const userLists = response.body?.userLists;
      expect(userLists, 'userLists array').to.be.an('array');

      // Prefer active lists with alerts analysis to avoid tab visibility issues on drafts
      const alertsEnabledList =
        userLists.find(
          (list) =>
            list.list_status_id === 2 &&
            Array.isArray(list.listAnalysesStatus) &&
            list.listAnalysesStatus.some(({ analysisId }) => analysisId === 'ALERTS')
        ) ||
        userLists.find(
          (list) =>
            Array.isArray(list.listAnalysesStatus) &&
            list.listAnalysesStatus.some(({ analysisId }) => analysisId === 'ALERTS')
        );

      if (!alertsEnabledList) {
        throw new Error('No list with an ALERTS analysis found in /api/locations response');
      }

      locationsPage.clickOnLocationsList(alertsEnabledList.list_name);
      cy.waitForLoadingMessage();
    });
  });

  When('I switch to the alerts tab', () => {
    listDetailsPage.clickOnAlertsTab();
    cy.waitForLoadingMessage();
  });

  Then('I should see the alerts land cover dataset selector with the default option', () => {
    listDetailsPage.elements
      .alertsLandCoverSelect()
      .should('contain.text', SBTN_NATURAL_LANDS_OPTION);
  });

  Then('I should see the alerts specific columns for the Natural Forest Map dataset', () => {
    listDetailsPage.getColumnHeader('Size (ha)').should('be.visible');
    listDetailsPage.getColumnHeader('Alerts in Natural Forest').should('be.visible');
    listDetailsPage.getColumnHeader('Alerts in Non-Forest').should('be.visible');
    listDetailsPage.findColumnHeader('Alerts in JRC Forest').should('not.exist');
    listDetailsPage.getColumnHeader('All Alerts').should('be.visible');
  });

  When('I switch the alerts land cover dataset to JRC Global Forest Cover', () => {
    listDetailsPage.selectAlertsLandCoverOption(JRC_GLOBAL_FOREST_OPTION);
    cy.waitForLoadingMessage();
  });

  Then('I should see the alerts specific columns for the JRC Global Forest Cover dataset', () => {
    listDetailsPage.elements
      .alertsLandCoverSelect()
      .should('contain.text', JRC_GLOBAL_FOREST_OPTION);
    listDetailsPage.getColumnHeader('Alerts in JRC Forest').should('be.visible');
    listDetailsPage.findColumnHeader('Alerts in Natural Forest').should('not.exist');
    listDetailsPage.findColumnHeader('Alerts in Non-Forest').should('not.exist');
    listDetailsPage.getColumnHeader('All Alerts').should('be.visible');
  });
});
