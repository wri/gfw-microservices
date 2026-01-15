import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

const SBTN_NATURAL_LANDS_OPTION = 'SBTN Natural Lands';
const JRC_GLOBAL_FOREST_OPTION = 'JRC Global Forest Cover';

describe('List Details - alerts tab', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page with alerts analysis', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    cy.waitForLoadingMessage();
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
