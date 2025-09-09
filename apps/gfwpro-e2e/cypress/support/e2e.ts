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

// Hide third-party network requests from Cypress command log
// Based on: https://dev.to/martin_chudomel/how-to-clean-up-cypress-command-log-by-hiding-third-party-requests-3dop
const hideThirdPartyRequests = Cypress.env('hideThirdPartyRequests');

if (hideThirdPartyRequests) {
  const app = window.top.document;
  const script = app.createElement('script');

  script.textContent = `
    function setupThirdPartyRequestFilter() {
      // Find the Cypress command log container
      const commandLog = document.querySelector('.reporter .container');

      if (commandLog) {
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              mutation.addedNodes.forEach((node) => {
                if (node instanceof Element) {
                  const commandInfo = node.querySelector('.command-info');

                  if (commandInfo) {
                    const commandMethodElement = commandInfo.querySelector('.command-method span');

                    if (commandMethodElement) {
                      const commandType = commandMethodElement.textContent;

                      // Check if this is a network request (xhr or fetch)
                      if (commandType === '(xhr)' || commandType === '(fetch)') {
                        const commandMessageText = commandInfo.querySelector('.command-message-text');

                        if (commandMessageText) {
                          // Use regex to robustly extract the first URL from the message text
                          const urlMatch = commandMessageText.textContent.match(/https?:\/\/[^\s]+|\/\/[^\s]+|www\.[^\s]+/);
                          const requestUrl = urlMatch ? urlMatch[0] : null;

                          // Hide requests that don't start with '/' (external/third-party requests)
                          // This includes requests to domains like:
                          // - Google Analytics/Tag Manager
                          // - Hotjar
                          // - Zendesk
                          // - Any other external tracking services
                          // Hide requests that are external/third-party:
                          // - If the URL contains '://', it's absolute (external)
                          // - If it doesn't start with '/', it's not a relative/internal request
                          if (requestUrl && (requestUrl.includes('://') || !requestUrl.startsWith('/'))) {
                            node.style.display = 'none';
                            console.log('Hidden third-party request:', requestUrl);
                          }
                        }
                      }
                    }
                  }
                }
              });
            }
          });
        });

        // Start observing the command log for changes
        observer.observe(commandLog, { childList: true, subtree: true });
        console.log('Third-party request filter initialized');
      } else {
        // Retry if command log not ready yet
        setTimeout(setupThirdPartyRequestFilter, 100);
      }
    }

    // Initialize the filter when the document is ready
    if (document.readyState === 'complete') {
      setupThirdPartyRequestFilter();
    } else {
      document.addEventListener('DOMContentLoaded', setupThirdPartyRequestFilter);
    }
  `;

  app.head.appendChild(script);
}
