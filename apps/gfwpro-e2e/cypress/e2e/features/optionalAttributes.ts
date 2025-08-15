import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';
import ListDetailsPage from '../../pages/listDetailsPage';

describe('Optional Attributes', () => {
  const locationsPage = new LocationsPage();
  const listDetailsPage = new ListDetailsPage();

  When('I login to the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I navigate to a list details page', () => {
    locationsPage.clickOnLocationsList('AAT Argentina Points Generic');
  });

  When('I add optional attributes to the locations table', () => {
    listDetailsPage.clickMoreOptionsTableColumnBtn();
    listDetailsPage.selectAllOptions();
  });

  Then('I should be able to see the optional attributes column headers', () => {
    listDetailsPage.getAllOptionsCount().then((optionsCount) => {
      listDetailsPage.getAllColumnsHeadersCount().then((columnsHeadersCount) => {
        expect(optionsCount - 1).to.equal(columnsHeadersCount);
      });
    });
  });
});
