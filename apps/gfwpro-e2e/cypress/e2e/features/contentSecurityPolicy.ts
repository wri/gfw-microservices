import { When, Given, Then } from '@badeball/cypress-cucumber-preprocessor';

let consoleErrorStub: Cypress.Agent<sinon.SinonStub>;

When('I login in the landing page', () => {
  cy.loginUI();
  cy.visit('/locations');
});

Given('I navigate to the map page', () => {
  // Intercept console errors before page load to catch CSP violations
  cy.visit('/map', {
    onBeforeLoad(win) {
      consoleErrorStub = cy.stub(win.console, 'error');
    },
  });
});

Then('ArcGIS scripts should load without CSP violations', () => {
  // Wait for the page to load and ArcGIS to initialize
  // Looking for zoom controls which indicate the map has loaded
  cy.get('[class*="control-panel__zoom"]', { timeout: 20000 }).should('exist');

  // Check that no CSP errors related to js.arcgis.com were logged
  cy.wrap(consoleErrorStub).should((stub) => {
    const cspErrors = stub
      .getCalls()
      .filter((call) =>
        call.args.some(
          (arg) =>
            typeof arg === 'string' &&
            arg.includes('js.arcgis.com') &&
            arg.includes('Content Security Policy')
        )
      );

    expect(cspErrors, 'No CSP errors for ArcGIS scripts should be present').to.have.length(0);
  });
});
