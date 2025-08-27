// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'cypress-file-upload';

// Handle module resolution errors at runtime
Cypress.on('uncaught:exception', (err) => {
  if (
    err.message.includes('plausible module') ||
    err.message.includes('Module not found') ||
    err.message.includes('plausible is not defined') || // Specifically ignore "plausible is not defined"
    err.message.includes('is not defined')
  ) {
    // Catch general "not defined" errors
    console.warn('Ignored error:', err.message);
    return false; // Ignore error and continue test
  }
  return true;
});

// Set language to English for all tests
beforeEach(() => {
  // Force English language settings
  cy.forceEnglishLanguage();
});

// Set language properties before page loads (for Transifex detection)
Cypress.on('window:before:load', (win) => {
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
