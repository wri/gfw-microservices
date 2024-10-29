import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import DiagnosticsPage from '../../pages/diagnosticsPage';
import * as User from '../../app-api/User';

const isFeatureStable = false;

describe('List diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();
  const diagnosticsPage = new DiagnosticsPage();

  Given('I am logged in', () => {
    if (isFeatureStable) {
      User.login();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to locations and select a user list', () => {
    if (isFeatureStable) {
      cy.visit('/locations');
      locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to locations and select a GFW list', () => {
    if (isFeatureStable) {
      cy.visit('/locations');
      locationsPage.clickOnLocationsList('Palm Oil Mills');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I click on the List Diagnostic button', () => {
    if (isFeatureStable) {
      listDetailsPage.clickOnListDiagnosticsBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I click on the map', () => {
    if (isFeatureStable) {
      diagnosticsPage.clickOnDiagnosticMap();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to the map page and view the GFW list loaded on the map', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to the map page and view the user list loaded on the map', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });
});
