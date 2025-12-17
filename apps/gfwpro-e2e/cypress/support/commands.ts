// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// eslint-disable-next-line @typescript-eslint/no-namespace
declare namespace Cypress {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Chainable<Subject> {
    loginUI(): void;
    login(email: string, password: string, verifyToken?: string): void;
    visitAndVerifyLoad(url: string, options?: Partial<Cypress.VisitOptions>): void;
    uploadFile(fileName: string): Chainable<void>;
    waitForLoadingMessage(checkExist?: boolean, locator?: string): void;
    forceEnglishLanguage(): void;
    dismissCookieBanner(): void;
  }
}

Cypress.Commands.add('uploadFile', (fileName, mimeType = '') => {
  cy.fixture(fileName, 'base64').then((fileContent) => {
    cy.get('[data-testid="file-input"]').attachFile({
      fileContent,
      fileName,
      mimeType,
    });
  });
});

// login using desktop header and verify MFA token
Cypress.Commands.add('login', (email: string, password: string, verifyToken = 'unsafe') => {
  cy.request({
    method: 'POST',
    url: '/auth/signinpost',
    body: {
      username: email,
      password: password,
    },
  });

  cy.request({
    method: 'POST',
    url: '/auth/verifyLogin',
    form: true,
    body: {
      tokenID: verifyToken,
    },
  });
});

Cypress.Commands.add('loginUI', () => {
  const deployment = Cypress.env('deployment');
  const credentials = Cypress.env(deployment);
  cy.visit(Cypress.config().baseUrl);
  cy.contains('Log in').click();
  cy.get('input').eq(0).type(credentials.username);
  cy.get('input').eq(1).type(credentials.password);
  cy.get('[data-cy="loginButton"]').first().click();
  cy.get('[data-cy="verifyToken"]').type(credentials.password);
  cy.contains('Verify').click();
  cy.location('href').should('include', '/locations');
});

Cypress.Commands.add('visitAndVerifyLoad', (url, options: Partial<Cypress.VisitOptions> = {}) => {
  const startTime = Date.now();

  const visitOptions = {
    timeout: options.timeout || Cypress.env('waittime'),
    ...options,
  };

  cy.visit(url, visitOptions).then(() => {
    cy.document()
      .its('readyState', { timeout: visitOptions.timeout })
      .should('eq', 'complete')
      .then(() => {
        const loadTime = Date.now() - startTime;
        cy.log(`Page loaded in ${loadTime} ms`);
        console.log(`Page loaded in ${loadTime} ms`);
      });
  });
});

Cypress.Commands.add('waitForLoadingMessage', (checkExist = true, locator = '.modal-loader') => {
  if (!checkExist) {
    cy.get(locator, { timeout: 60000 }).should('not.be.visible');
  } else {
    cy.get(locator, { timeout: 60000 }).should('be.visible');
    cy.get(locator, { timeout: 60000 }).should('not.be.visible');
  }
});

Cypress.Commands.add('forceEnglishLanguage', () => {
  cy.window().then((win) => {
    // Override navigator language properties (used by Transifex)
    Object.defineProperty(win.navigator, 'language', {
      value: 'en-US',
      writable: false,
      configurable: true,
    });

    Object.defineProperty(win.navigator, 'languages', {
      value: ['en-US', 'en'],
      writable: false,
      configurable: true,
    });
  });

  cy.log('Forced English language settings applied');
});

Cypress.Commands.add('dismissCookieBanner', () => {
  // Wait for the cookie banner to appear and dismiss it
  cy.get('body', { timeout: 10000 }).then(($body) => {
    // Check if Osano cookie banner exists and is visible
    const $banner = $body.find('.osano-cm-dialog, .osano-cm-window');
    if ($banner.length > 0 && $banner.is(':visible')) {
      cy.log('Cookie banner detected, attempting to dismiss...');
      // Wait a moment for the banner to fully render
      cy.wait(500);
      // Try multiple selectors for the dismiss/accept button
      cy.get('.osano-cm-accept-all, .osano-cm-accept, .osano-cm-close, .osano-cm-save', {
        timeout: 5000,
      })
        .first()
        .click({ force: true, multiple: true });
      cy.log('Cookie banner dismissed');
      // Wait for the banner to disappear
      cy.get('.osano-cm-dialog, .osano-cm-window', { timeout: 5000 }).should('not.be.visible');
    } else {
      cy.log('No cookie banner found or already dismissed');
    }
  });
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Cannot read properties of undefined')) {
    return false;
  }
  // Ignore AbortError from navigation issues
  if (err.message.includes('Aborted') || err.name === 'AbortError') {
    return false;
  }
  return true;
});

//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })
