import { When, Then } from '@badeball/cypress-cucumber-preprocessor';
import * as User from '../../app-api/User';
import MapPage from '../../pages/mapPage';

describe('Maps View', () => {
  const mapPage = new MapPage();

  When('I login in the landing page', () => {
    User.login();
    cy.visit('/map');
  });

  Then('I Navigate to Maps screen', () => {
    cy.url().should('include', '/map');
    mapPage.clickOnLanguage();
    mapPage.selectEnglishLenguage();
  });

  // //Button Plus zoom
  Then('I should be able to zoom in', () => {
    mapPage.clickOnZoomIn();
  });

  //Button minus zoom
  Then('I should be able to zoom out', () => {
    mapPage.clickOnZoomOut();
  });

  //Modal Analysis / Base Map
  Then('I test modal Analysis Base Map', () => {
    expect(mapPage.elements.tabModalBaseMap().should('be.visible'));
    expect(mapPage.elements.tabModalAnalysis().should('be.visible'));

    expect(mapPage.elements.tabDrawFormInAnalysis().should('be.visible'));
    expect(mapPage.elements.tabCountryOrRegionInAnalysis().should('be.visible'));
    expect(mapPage.elements.tabBodyInAnalysis().should('be.visible'));
    expect(
      mapPage.elements
        .tabBodyInAnalysis()
        .contains('Draw in the map the area you want to analyze or subscribe to')
    );
    mapPage.clickOnStartDraw();
    expect(mapPage.elements.cancelDrawBtn().should('be.visible'));
    mapPage.clickOnCancelBtn();
    expect(mapPage.elements.startDrawBtn().should('be.visible'));
    mapPage.clickTabCountryOrRegion();
    expect(mapPage.elements.selectCountryBtn().should('be.visible'));
    expect(mapPage.elements.analizeBtn().should('be.disabled'));
    expect(mapPage.elements.addBtn().should('be.disabled'));

    // Tab Base Map
    mapPage.clickOnTabModalBaseMap();
    mapPage.clickOnOptionDefaultBaseMap();
    expect(mapPage.elements.tabModalBaseMap().should('be.visible'));
    expect(mapPage.elements.optionDefaultBaseMapBtn().should('be.visible'));
    expect(mapPage.elements.infoDefaultBaseMapBtn().should('be.visible'));
    mapPage.clickOnOptionTerrainBaseMap();
    mapPage.clickOnOptionSatelliteBaseMap();
    mapPage.clickOnOptionoptionLandsatBaseMap();
    mapPage.clickOnOptionOpenStreetBaseMap();
    mapPage.clickOnOptionDarkMatterBaseMap();
    mapPage.clickOnOptionPositronBaseMap();
    mapPage.clickOnOptionHybridBaseMap();
    mapPage.clickOnOptionTreeHeightBaseMap();
    mapPage.clickOnOptionPlanetBaseMap();
  });

  //Global Data
  Then('I test global data', () => {
    mapPage.clickOnEyeTreeCoverLoss();
    mapPage.clickOnEyeTreeCoverGain();
    mapPage.clickOnEyeTreeCover();
  });

  //Button search
  Then('I test search button', () => {
    // I should be tab search
    mapPage.clickOnSearch();
    mapPage.wait(20000);
    mapPage.clickOnInputSearch();
    expect(mapPage.elements.suggestionInputDefault().should('be.visible'));
    expect(mapPage.elements.clearInputBtn().should('not.exist'));
    mapPage.elements.inputSearch().type('argentina');
    mapPage.elements.clearInputBtn().click();
    expect(mapPage.elements.inputSearch().should('have.value', ''));
    mapPage.clickOnOptionLocationSearchBtn();
    mapPage.clickOnOptionTodoLocationSearch();
    mapPage.clickToCloseSearchLocation();
    expect(mapPage.elements.inputSearch().should('not.be.visible'));

    // I should be tab coordinates
    mapPage.clickOnSearch();
    mapPage.clickOnTabCoordinates();
    expect(mapPage.elements.selectNorthSouthOption().should('have.value', 'N'));
    expect(mapPage.elements.selectWestEastOption().should('have.value', 'W'));
    mapPage.clickOnSearchCoordinates();
    expect(mapPage.elements.tabCoordinates().should('not.be.visible'));

    // I should be tab decimal degrees
    mapPage.clickOnSearch();
    mapPage.clickOnTabDecimalDegrees();
    expect(
      mapPage.elements
        .inputDecimalDegreesFirst()
        .should('have.attr', 'type')
        .should('equal', 'number')
    );
    expect(
      mapPage.elements
        .inputDecimalDegreesLast()
        .should('have.attr', 'type')
        .should('equal', 'number')
    );
    mapPage.clickOnSearchDecimalDegrees();
    expect(mapPage.elements.searchDecimalDegreesBtn().should('be.visible'));
    mapPage.clickToCloseSearchLocation();
    expect(mapPage.elements.searchDecimalDegreesBtn().should('not.be.visible'));
  });

  //Bar select time

  //Button start draw

  //Show Panel

  //View information in tabs
});
