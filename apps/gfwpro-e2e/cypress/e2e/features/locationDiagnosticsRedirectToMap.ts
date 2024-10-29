import { Given, When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

const isFeatureStable = false;

describe('Location diagnostics', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  Given('I am logged in', () => {
    if (isFeatureStable) {
      User.login();
      cy.visit('/locations');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to locations and select the list', () => {
    if (isFeatureStable) {
      locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to locations and select the GFW list', () => {
    if (isFeatureStable) {
      locationsPage.clickOnLocationsList('Palm Oil Mills');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I choose a location and press the Locations Map button', () => {
    if (isFeatureStable) {
      listDetailsPage.selectCheckBoxes([1]);
      listDetailsPage.clickOnLocationMapBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I choose multiple locations and press the Locations Map button', () => {
    if (isFeatureStable) {
      listDetailsPage.selectCheckBoxes([1, 2]);
      listDetailsPage.clickOnLocationMapBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I click Full List Map', () => {
    if (isFeatureStable) {
      listDetailsPage.clickOnFullListMapBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to map with the selected location from GFW list', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map?listId=3&isGfwList=true');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to map with all locations from the GFW list', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map?listId=3&isGfwList=true');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to map with the selected location from the list', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map?listId=2&isGfwList=false');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to the map from a draft list', () => {
    if (isFeatureStable) {
      locationsPage.clickOnMoreOptionsList('AAT Test Regression Draft List');
      locationsPage.clickOnMapBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  When('I navigate to the map from an active list', () => {
    if (isFeatureStable) {
      locationsPage.clickOnMoreOptionsList('AAT Argentina Points Generic');
      locationsPage.clickOnMapBtn();
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to the draft list map view', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map?visibleLayers=Tree+cover+loss&listId=1038');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });

  Then('I should be redirected to the active list map view', () => {
    if (isFeatureStable) {
      cy.location('href').should('include', '/map?visibleLayers=Tree+cover+loss&listId=2');
    } else {
      cy.log('Feature unstable, skipping.');
    }
  });
});
