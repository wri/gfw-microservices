import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Add Locations to Existing List', () => {
  const locationsPage = new LocationsPage();
  const list = 'AAT ADD LOCATION TEST';
  const timestamp = Date.now();
  const locationName = `testAddLocation${timestamp}`;
  const longitude = '-78.14';
  const latitude = '-6.31';

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I click on Add Location and select the Single Location option', () => {
    locationsPage.clickOnAddLocationsBtn();
    locationsPage.clickOnSingleLocationBtn();
    locationsPage.clickOnContinueBtn();
  });

  When('I select the list AAT ADD LOCATION TEST and complete the form', () => {
    locationsPage.clickOnComodityBtn();
    locationsPage.clickOnCattleGeneriOptionBtn();
    locationsPage.addLocationName(locationName);
    locationsPage.clickOnAddListToExistingListBtn();
    locationsPage.selectExistingListOption(list);
    locationsPage.selectLocationClassification('Property');
    locationsPage.clickOndrawAShapeOptionBtn();
    locationsPage.clickOnAddCoordinatesnBtn();
    locationsPage.addLatitude(latitude);
    locationsPage.addLongitude(longitude);
    locationsPage.clickOnConfirmActionBtn();
    cy.intercept(
      'POST',
      'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Utilities/Geometry/GeometryServer/areasAndLengths'
    ).as('fetchRequest');
    cy.wait('@fetchRequest', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
    locationsPage.clickOnSaveAsDraft();
    locationsPage.clickOnConfirmActionBtn();
  });
  Then('I should see the location added successfully', () => {
    locationsPage.elements.titleAddedLocation().should('be.visible');
    locationsPage.elements.descriptionAddedLocation(list).should('be.visible');
    locationsPage.elements.confirmActionBtn().should('be.visible');
    locationsPage.clickOnConfirmActionBtn();
  });
});
