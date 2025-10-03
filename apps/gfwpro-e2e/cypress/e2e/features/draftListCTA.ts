import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Draft List CTA', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login to the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('Test Deforestation Arg');
  });

  When('I search for a list in draft state', () => {
    locationsPage.searchLocation('Test Deforestation Arg');
  });

  Then('I should be able to see the draft list CTA in the Locations Page', () => {
    locationsPage.elements
      .listResultContainer()
      .should(
        'have.attr',
        'title',
        'This list contains unanalyzed locations. Please click the submit button to run analysis. Once submitted, your list will not be accessible until analysis is complete.'
      );
    locationsPage.elements.draftCTA().should('be.visible');
  });

  Then('I should be able to see the draft list CTA in the List Details Page', () => {
    listDetailsPage.elements.draftAlert().should('be.visible');
    listDetailsPage.elements.submitAnalysisButton().should('be.visible');
  });
});
