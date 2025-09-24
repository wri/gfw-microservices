import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Palm Risk Assessmen', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When(
    'I navigate to the details page of a user list that has palm risk assessment analysis',
    () => {
      locationsPage.clickOnLocationsList('AAT Indonesia Palm Oil Generic');
    }
  );

  When(
    'I navigate to the details page of a GFW list that has palm risk assessment analysis',
    () => {
      locationsPage.clickOnLocationsList('Palm Oil Mills');
    }
  );

  When('I switch to the palm risk assessment tab', () => {
    listDetailsPage.clickOnPalmRiskAssessmentTab();
  });

  Then('I should see the table with the expected data', () => {
    listDetailsPage.getTableRowCount().should('equal', 50);
    listDetailsPage.getDotsCount().should('equal', 350);
    listDetailsPage.validateLocationColumn();
    listDetailsPage.validateMillPriorityAndOverallThreatsAndValues();
  });
});
