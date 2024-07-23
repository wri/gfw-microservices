import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';
import * as User from '../../app-api/User';

describe('Copy List', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I click on list diagnostic button', () => {
    listDetailsPage.clickOnListDiagnosticsBtn();
  });

  Then('I should see the copy view', () => {
    listDetailsPage.clickOnCheckBoxSelectAll();
    listDetailsPage.clickOnMoveBtn();
    listDetailsPage.clickOnCreateNewListRadioBtn();
    listDetailsPage.elements.inputCreateNewList().type('testregresioncopylisttomove');
    listDetailsPage.clickOnSaveAsDraftBtn();
    expect(listDetailsPage.elements.titleConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.descriptionConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.confirmActionBtn().should('be.visible'));
    listDetailsPage.clickOnConfirmActionBtn();

    listDetailsPage.clickOnCheckBoxSelectAll();
    listDetailsPage.clickOnMoveBtn();
    listDetailsPage.clickOnCreateNewListRadioBtn();
    listDetailsPage.elements.inputCreateNewList().type('testregresioncopylisttoremove');
    listDetailsPage.clickOnSaveAsDraftBtn();
    expect(listDetailsPage.elements.titleConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.descriptionConfirmCopyList().should('be.visible'));
    expect(listDetailsPage.elements.confirmActionBtn().should('be.visible'));
    listDetailsPage.clickOnConfirmActionBtn();
  });
});
