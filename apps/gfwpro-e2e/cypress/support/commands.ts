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
  cy.dismissCookieBanner();
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
    // When using the default locator, check the parent dialog instead
    // since .modal-loader is inside .modal-loader__dialog which has the 'hidden' class when not visible
    if (locator === '.modal-loader') {
      // Check if a visible loader exists - if yes, wait for it. If no, continue.
      cy.get('body').then(($body) => {
        const allDialogs = $body.find('.modal-loader__dialog');
        const visibleDialog = Array.from(allDialogs).find((el) => !el.classList.contains('hidden'));

        if (visibleDialog) {
          // Found a visible loader, wait for it to finish
          cy.wrap(visibleDialog, { timeout: 60000 }).should('have.class', 'hidden');
        } else {
          // No visible loader found - this is fine, assume no loading is needed
          // Some actions (like tab clicks) may not trigger a loader if data is already loaded
          cy.log('No visible modal loader found - assuming no loading is needed');
        }
      });
    } else {
      // For custom locators, use the original behavior
      cy.get(locator, { timeout: 60000 }).should('be.visible');
      cy.get(locator, { timeout: 60000 }).should('not.be.visible');
    }
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
  // NOTE: This handles third-party Osano cookie consent banner
  // We cannot add data-cy attributes to third-party components
  // Using Osano's stable class names as primary selectors with text fallback

  // Try to find and click the accept button, but don't fail if it doesn't exist
  cy.get('body', { timeout: 5000 }).then(($body) => {
    const banner = $body.find('.osano-cm-dialog, .osano-cm-window__dialog');
    const bannerVisible = banner.length > 0 && banner.is(':visible');
    const acceptButton = $body.find('.osano-cm-accept, .osano-cm-accept-all');
    const buttonVisible = acceptButton.length > 0 && acceptButton.is(':visible');

    if (bannerVisible && buttonVisible) {
      // Banner and button are visible, click it directly without timeout since we verified it exists
      cy.wrap(acceptButton.first()).click({ force: true });
      cy.log('Cookie banner dismissed');
    } else {
      // Banner or button not found/visible - may already be dismissed or not loaded yet
      cy.log('Osano cookie banner not found or not ready - may already be dismissed');
    }
  });
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes('Cannot read properties of undefined')) {
    return false;
  }

  if (err.message.includes('Aborted') || err.name === 'AbortError') {
    return false;
  }

  // Plausible / module-resolution errors are ignored centrally in e2e.ts
  // (shouldIgnoreUncaughtException) to keep a single source of truth.

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
