import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload location', () => {
  const timestamp = Date.now();
  const listToUploadPolygonLocation = `uploadPolygonLocation${timestamp}`;
  const listToUploadPointLocation = `uploadPointLocation${timestamp}`;
  const locationsPage = new LocationsPage();
  Given('I login to the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Locations button', () => {
    locationsPage.clickOnAddLocationsBtn();
  });

  When('I select the Polygon option', () => {
    locationsPage.clickOnPolygonBtn();
  });
  When('I select the Point option', () => {
    locationsPage.clickOnPointBtn();
  });

  When('I complete the polygon form and confirm', () => {
    locationsPage.inputNewLocationName(listToUploadPolygonLocation);
    locationsPage.ClickOnEnterPolygonCoordsBtn();
    locationsPage.typeOnInputCoordLat1('14.072');
    locationsPage.typeOnInputCoordLong1('-12.928,0');
    locationsPage.typeOnInputCoordLat2('14.072');
    locationsPage.typeOnInputCoordLong2('-12.928,0');
    locationsPage.typeOnInputCoordLat3('14.072');
    locationsPage.typeOnInputCoordLong3('-12.928,0');
    locationsPage.clickOnConfirmCoods();
    locationsPage.clickOnNextBtn();
  });

  When('I complete the point form and confirm', () => {
    locationsPage.inputNewLocationName(listToUploadPointLocation);
    locationsPage.ClickOnEnterPointCoordsBtn();
    locationsPage.enterPointLongitude('-12.928,0');
    locationsPage.enterPointLatitude('14.072');
    locationsPage.enterRadiusAroundLocation('100');
    locationsPage.clickOnNextBtn();
  });

  When('I complete the Configure List step for a new Polygon list', () => {
    locationsPage.selectCommodity('Coffee');
    locationsPage.inputNewListName(listToUploadPolygonLocation);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.selectAnalisysType('post-2000');
    locationsPage.clickOnNextBtn();
  });

  When('I complete the Configure List step for a new Point list', () => {
    locationsPage.selectCommodity('Coffee');
    locationsPage.inputNewListName(listToUploadPointLocation);
    locationsPage.selectAnalisysType('post-2020');
    locationsPage.selectAnalisysType('post-2000');
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
});
