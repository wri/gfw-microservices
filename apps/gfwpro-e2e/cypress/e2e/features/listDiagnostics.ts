import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';

describe('List diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When(
    'I navigate to the details page of a user list that has palm risk assessment analysis',
    () => {
      locationsPage.clickOnLocationsList('AAT Indonesia Palm Oil Generic');
    }
  );

  When('I click on list diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should be redirected to diagnostic view', () => {
    cy.url().should('include', '/diagnostics?listId=2');
    cy.get('.diagnostics-menu-bar').scrollIntoView();
    expect(diagnosticsPage.elements.reportBtn().should('be.visible'));
    expect(diagnosticsPage.elements.downloadBtn().should('be.visible'));
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
