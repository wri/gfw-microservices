import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('Information Bubbles', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  When('I login in the landing page', () => {
    cy.on('uncaught:exception', () => {
      // work around for existing errors that otherwise fail the test
      return false;
    });
    cy.visit('/');

    const deployment = Cypress.env('deployment');
    const credentials = Cypress.env(deployment);
    cy.get('[data-cy="desktopHeader"]').then((desktopHeader) => {
      cy.wrap(desktopHeader).find('[data-cy="loginNav"]').click();
      cy.wrap(desktopHeader).find('[data-cy="username"]').type(credentials.username);
      cy.wrap(desktopHeader).find('[data-cy="password"]').type(credentials.password);
      cy.wrap(desktopHeader).find('[data-cy="loginButton"]').click();
    });

    cy.get('[data-cy="verifyToken"]').type(credentials.password);
    cy.get('[data-cy="verifyButton"]').click();
  });

  When('I navigate to a list diagnostic page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be able to see each info bubbles content including links if available', () => {
    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.historicSiteCharacteristicsInfoBubble);
    diagnosticsPage.verifyHistoricSiteCharacteristicsInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.listAttributesInfoBubble);
    diagnosticsPage.verifyListAttributesInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.lossOfForestsInfoBubble);
    diagnosticsPage.verifyLossOfForestsInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.lossAllYearsInfoBubble);
    diagnosticsPage.verifyLossAllYearsInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.historicAreaLossInfoBubble);
    diagnosticsPage.verifyHistoricAreaLossInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.tclInfoBubble);
    diagnosticsPage.verifyTclInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.brazilBiomesPercentOverlapInfoBubble);
    diagnosticsPage.verifyBrazilBiomesPercentOverlapInfoBubble();
    diagnosticsPage.closeInfoBubble();

    diagnosticsPage.navigateToArgentinaRegionTab();
    diagnosticsPage.openInfoBubble(diagnosticsPage.elements.tclArgentinaOTBNInfoBubble);
    diagnosticsPage.verifyTclArgentinaOTBNInfoBubble();
    diagnosticsPage.closeInfoBubble();
  });
});
