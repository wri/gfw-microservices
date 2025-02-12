import { When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Downloading Templates', () => {
  const locationPage = new LocationsPage();
  When('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Location Alpa button and select the file upload option', () => {
    locationPage.clickOnAddLocationsAlphaBtn();
    locationPage.clickOnfileUploadBtn();
  });
});
