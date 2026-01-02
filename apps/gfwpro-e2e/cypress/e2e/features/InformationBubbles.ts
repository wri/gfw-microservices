import { Before, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('Information Bubbles', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  // Clear info bubble cache before each test to ensure test isolation
  // This prevents interference from previous tests when running all tests together
  Before(() => {
    // Visit baseUrl to get a window context, then clear localStorage
    cy.visit(Cypress.config().baseUrl || '/', { failOnStatusCode: false });
    cy.window().then((win) => {
      // Clear localStorage for info bubble related keys
      const keys = Object.keys(win.localStorage);
      keys.forEach((key) => {
        if (key.toLowerCase().includes('info-bubble') || key.toLowerCase().includes('gfw-info')) {
          win.localStorage.removeItem(key);
        }
      });
      // Also clear sessionStorage if needed
      const sessionKeys = Object.keys(win.sessionStorage);
      sessionKeys.forEach((key) => {
        if (key.toLowerCase().includes('info-bubble') || key.toLowerCase().includes('gfw-info')) {
          win.sessionStorage.removeItem(key);
        }
      });
    });
  });

  When('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to a list diagnostic page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    cy.url().should('include', '/list-details');
    listDetailsPage.clickOnPost2000Tab();
    cy.waitForLoadingMessage();
    listDetailsPage.clickOnListDiagnosticsBtn();
    cy.url().should('include', '/diagnostics');
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
