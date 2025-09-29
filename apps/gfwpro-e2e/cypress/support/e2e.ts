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
  const resolveTopWindow = (): Window | null => {
    try {
      const candidate = window.top ?? window;
      void candidate.document;
      return candidate as Window;
    } catch (error) {
      console.warn('Third-party request filter not applied: unable to access top window.', error);
      return null;
    }
  };

  const topWindow = resolveTopWindow();

  if (topWindow) {
    const topDocument = topWindow.document;

    if (!topDocument.head) {
      console.warn('Third-party request filter not applied: top window has no <head> element.');
    } else if (!topDocument.head.querySelector('script[data-third-party-request-filter]')) {
      const script = topDocument.createElement('script');
      script.setAttribute('data-third-party-request-filter', 'true');
      script.textContent = String.raw`
        (function () {
          if (window.__thirdPartyRequestFilterApplied) {
            return;
          }

          window.__thirdPartyRequestFilterApplied = true;

          var HIDDEN_CLASS = 'third-party-request-hidden';

          function ensureStyles() {
            if (!document.querySelector('style[data-third-party-request-filter]')) {
              var styleEl = document.createElement('style');
              styleEl.setAttribute('data-third-party-request-filter', 'true');
              styleEl.textContent = '.' + HIDDEN_CLASS + ' { display: none !important; }';
              document.head.appendChild(styleEl);
            }
          }

          function getRequestUrlFromNode(node) {
            if (!(node instanceof HTMLElement)) {
              return null;
            }

            var selectors = [
              '.command-message-url',
              '.command-message-text',
              '.command-message',
              '.command-info'
            ];
            for (var i = 0; i < selectors.length; i++) {
              var el = node.querySelector(selectors[i]);
              if (el && el.textContent) {
                var url = extractUrl(el.textContent);
                if (url) {
                  return url;
                }
              }
            }

            return extractUrl(node.textContent || '');
          }

          function extractUrl(textContent) {
            if (!textContent) {
              return null;
            }

            var normalization = String(textContent).replace(/\s+/g, ' ').trim();
            if (!normalization) {
              return null;
            }

            var urlPattern = /https?:\/\/[^\s]+|\/\/[^\s]+|www\.[^\s]+/i;
            var match = normalization.match(urlPattern);
            return match ? match[0] : null;
          }

          function isThirdPartyRequest(requestUrl) {
            if (!requestUrl) {
              return false;
            }

            var absoluteUrl = requestUrl;
            if (requestUrl.indexOf('://') === -1) {
              // Handle protocol-relative URLs (//example.com)
              absoluteUrl = window.location.protocol + requestUrl;
            }

            try {
              var url = new URL(absoluteUrl, window.location.origin);
              return url.hostname !== window.location.hostname;
            } catch (error) {
              // If URL parsing fails, err on the side of hiding.
              return true;
            }
          }

          function processNode(node) {
            if (!(node instanceof HTMLElement)) {
              return;
            }

            node.classList.remove(HIDDEN_CLASS);
            node.style.removeProperty('display');

            var commandNameElement = node.querySelector('.command-name');
            var commandName = commandNameElement ? String(commandNameElement.textContent || '').toLowerCase() : '';
            if (commandName && commandName.indexOf('xhr') === -1 && commandName.indexOf('fetch') === -1) {
              // Only hide network-related entries.
              return;
            }

            var requestUrl = getRequestUrlFromNode(node);
            if (isThirdPartyRequest(requestUrl)) {
              node.classList.add(HIDDEN_CLASS);
              console.log('Hidden third-party request:', requestUrl);
            }
          }

          function initialize() {
            ensureStyles();

            var commandLog = document.querySelector('.reporter .container');
            if (!commandLog) {
              setTimeout(initialize, 100);
              return;
            }

            Array.prototype.forEach.call(commandLog.children, processNode);

            if (typeof MutationObserver === 'undefined') {
              console.warn('Third-party request filter not applied: MutationObserver unavailable.');
              return;
            }

            var observer = new MutationObserver(function (mutations) {
              mutations.forEach(function (mutation) {
                Array.prototype.forEach.call(mutation.addedNodes, processNode);
              });
            });

            observer.observe(commandLog, { childList: true, subtree: true });
            console.log('Third-party request filter initialized');
          }

          if (document.readyState === 'complete') {
            initialize();
          } else {
            document.addEventListener('DOMContentLoaded', initialize, { once: true });
          }
        })();
      `;

      topDocument.head.appendChild(script);
    }
  }
}
