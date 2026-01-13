import { Before, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  // Ensure clean state before each scenario
  Before(() => {
    // Small delay to prevent rapid successive logins
    cy.wait(100);
  });

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page and click on a location checkbox', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When(
    'I navigate to the details page of a user list that has palm risk assessment analysis',
    () => {
      locationsPage.clickOnLocationsList('AAT Indonesia Palm Oil Generic');
    }
  );

  When('I click on location diagnostic button', () => {
    listDetailsPage.clickOnPost2000Tab();
    cy.waitForLoadingMessage();
    listDetailsPage.clickOnLocationDiagnosticsBtnOnHover();
  });

  Then('I should be redirected to diagnostic view', () => {
    cy.url().should('include', '/diagnostics?listId=2&locationId=');
    cy.get('.diagnostics-menu-bar').scrollIntoView();
    expect(diagnosticsPage.elements.reportBtn().should('be.visible'));
    expect(diagnosticsPage.elements.downloadBtn().should('be.visible'));
    expect(diagnosticsPage.elements.diagnosticsMap().should('be.visible'));
    expect(diagnosticsPage.elements.headerInfo().invoke('text').should('include', 'a1'));
  });

  When('I switch to the palm risk assessment tab', () => {
    listDetailsPage.clickOnPalmRiskAssessmentTab();
  });

  When('I click on the diagnostics palm risk assessment tab', () => {
    diagnosticsPage.clickOnPalmRiskAssessmentTab();
  });

  Then('I should see the palm risk assessment data charts', () => {
    diagnosticsPage.verifyChartVisibility('Trends in Deforestation');
    diagnosticsPage.verifyChartVisibility('Palm Risk Analysis');
  });
});
