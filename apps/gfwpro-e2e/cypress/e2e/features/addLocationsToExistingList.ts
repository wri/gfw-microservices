import { Before, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Add Locations to Existing List', () => {
  const locationsPage = new LocationsPage();
  const list = 'AAT ADD LOCATION TEST';
  let timestamp: number;
  let locationName: string;
  const longitude = '-78.14';
  const latitude = '-6.31';

  Before(() => {
    timestamp = Date.now() + Math.floor(Math.random() * 1000);
    locationName = `testAddLocation${timestamp}`;
  });

  When('I login in the landing page', () => {
    cy.loginUI();
    cy.visit('/locations');
  });

  When('I click on Add Location', () => {
    locationsPage.clickOnAddLocationsBtn();
  });

  When('I select the Point option', () => {
    locationsPage.clickOnPointBtn();
  });

  When('I complete the point form and confirm', () => {
    locationsPage.inputNewLocationName(locationName);
    locationsPage.ClickOnEnterPointCoordsBtn();
    locationsPage.enterPointLongitude('-12.928,0');
    locationsPage.enterPointLatitude('14.072');
    locationsPage.enterRadiusAroundLocation('100');
    locationsPage.clickOnNextBtn();
  });

  When('I complete the Configure List step for an existing list', () => {
    locationsPage.selectCommodity('Cattle');
    locationsPage.selectExistingList(list);
    locationsPage.selectAnalisysType('defReport');
    locationsPage.clickOnNextBtn();
  });

  When('I submit the list for analysis', () => {
    locationsPage.clickOnSubmitAnalisys();
    locationsPage.clickOnConfirmAnalisysBtn();
  });

  Then('I should see the confirmation message', () => {
    locationsPage.elements.titleFinishLegend().should('be.visible');
    locationsPage.elements.subtitleFinishLegend().should('be.visible');
    locationsPage.elements.returnToLocationBtn().should('be.visible');
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
