import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Move List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('testregresioncopylisttomove');
  });

  Then('I should see the move view', () => {
    listDetailsPage.clickOnCheckBoxSelectAll();
    listDetailsPage.clickOnMoveBtn();
    listDetailsPage.clickOnMoveSectionRadioBtn();

    //Select list newlistcopytest
    listDetailsPage.selectList('testregresioncopylisttoremove');
    listDetailsPage.clickOnSaveAsDraftBtn();
    expect(listDetailsPage.elements.titleConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.descriptionConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.confirmActionBtn().should('be.visible'));
    listDetailsPage.clickOnConfirmActionBtn();
  });
});
