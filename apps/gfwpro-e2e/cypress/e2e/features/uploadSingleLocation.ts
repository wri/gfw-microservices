import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Upload location', () => {
  const timestamp = Date.now();
  const listToUploadPolygonLocation = `uploadPolygonLocation${timestamp}`;
  const listToUploadPointLocation = `uploadPointLocation${timestamp}`;
  const locationPage = new LocationsPage();
  Given('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Location button', () => {
    locationPage.clickOnAddLocations2Btn();
  });

  When('I select the Polygon option', () => {
    locationPage.clickOnPolygonBtn();
  });
  When('I select the Point option', () => {
    locationPage.clickOnPointBtn();
  });

  When('I complete the polygon form and confirm', () => {
    locationPage.typeNewNameLocation(listToUploadPolygonLocation);
    locationPage.ClickOnEnterPolygonCoordsBtn();
    locationPage.typeOnInputCoordLat1('14.072');
    locationPage.typeOnInputCoordLong1('-12.928,0');
    locationPage.typeOnInputCoordLat2('14.072');
    locationPage.typeOnInputCoordLong2('-12.928,0');
    locationPage.typeOnInputCoordLat3('14.072');
    locationPage.typeOnInputCoordLong3('-12.928,0');
    locationPage.clickOnConfirmCoods();
    locationPage.clickOnNextBtn();
    locationPage.selectCommodity('Coffee');
    locationPage.typeNewNameListPolygon(listToUploadPolygonLocation);
    locationPage.clickOnNextBtn();
    locationPage.clickOnSubmitAnalisys();
    locationPage.clickOnConfirmAnalisysBtn();
  });
  When('I complete the point form and confirm', () => {
    locationPage.typeNewNameLocation(listToUploadPointLocation);
    locationPage.ClickOnEnterPointCoordsBtn();
    locationPage.typeOnInputPointCoordLong('-12.928,0');
    locationPage.typeOnInputPointCoordLat('14.072');
    locationPage.typeOnInputRadiusAroundLoc('100');
    locationPage.clickOnNextBtn();
    locationPage.selectCommodity('Coffee');
    locationPage.typeNewNameListPoint(listToUploadPointLocation);
    locationPage.clickOnNextBtn();
    locationPage.clickOnSubmitAnalisys();
    locationPage.clickOnConfirmAnalisysBtn();
  });

  Then('I should see the completion legend', () => {
    locationPage.elements.titleFinishLegend().should('be.visible');
    locationPage.elements.subtitleFinishLegend().should('be.visible');
    locationPage.elements.returnToLocationBtn().should('be.visible');
  });
});
