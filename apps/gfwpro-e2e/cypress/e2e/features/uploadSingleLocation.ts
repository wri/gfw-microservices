import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import LocationsPage from '../../pages/locationsPage';

describe('Downloading Templates', () => {
  const KML = 'KML.kml'
  const timestamp = Date.now();
  const listToUploadSingleLocation = `uploadSingleLocation${timestamp}`;
  const locationPage = new LocationsPage();
  Given('I login in the landing page', () => {
    cy.loginUI();
  });

  When('I navigate to the Locations page', () => {
    cy.visit('/locations');
  });

  When('I click on the Add Location Alpha button and select the file upload option', () => {
    locationPage.clickOnAddLocationsAlphaBtn();
    locationPage.clickOnfileUploadBtn();
  });

  When('I click on the Drop file button and drag a KML file', () => {
    cy.uploadFile( KML, 'application/vnd.google-earth.kml+xml');
    locationPage.clickOnNextBtn()
    locationPage.clickOnNextBtn()
  });
  
  Then('I complete the form and confirm the upload', () => {
    locationPage.selectCommodity('other')
    locationPage.typeNewNameList(listToUploadSingleLocation)
    locationPage.clickOnNextBtn()
    locationPage.clickOnSubmitAnalisys()
    locationPage.clickOnConfirmAnalisysBtn()
  });


});
