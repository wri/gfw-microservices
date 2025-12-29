import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('Information Bubbles', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
    // Wait for locations page to be fully loaded
    cy.url().should('include', '/locations');
    cy.get('body').should('be.visible');
    // Clear any info bubble cache that might interfere with the test
    cy.window().then((win) => {
      const keys = Object.keys(win.localStorage);
      keys.forEach((key) => {
        if (key.toLowerCase().includes('info-bubble') || key.toLowerCase().includes('gfw-info')) {
          win.localStorage.removeItem(key);
        }
      });
    });
  });

  When('I navigate to a list diagnostic page', () => {
    // Ensure we're on the locations page and wait for list to be visible
    cy.url().should('include', '/locations');
    cy.contains('AAT Argentina Points Generic').should('be.visible');
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    // Wait for list details page to load
    cy.url().should('include', '/list-details');
    listDetailsPage.clickOnPost2000Tab();
    cy.waitForLoadingMessage();
    listDetailsPage.clickOnListDiagnosticsBtn();
    // Wait for diagnostics page to load
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
