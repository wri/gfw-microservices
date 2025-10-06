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

const createFilterScript = (
  origin: string,
  hostname: string,
  allowedHostSuffixes: string[],
  allowedSubstringPatterns: string[]
): string => {
  const serializedOrigin = JSON.stringify(origin);
  const serializedHostname = JSON.stringify(hostname);
  const serializedSuffixes = JSON.stringify(allowedHostSuffixes);
  const serializedSubstrings = JSON.stringify(allowedSubstringPatterns);

  return String.raw`
(function () {
  if (window.__thirdPartyRequestFilterApplied) {
    return;
  }

  window.__thirdPartyRequestFilterApplied = true;

  var FIRST_PARTY_ORIGIN = ${serializedOrigin};
  var FIRST_PARTY_HOSTNAME = ${serializedHostname};
  var ALLOWED_HOST_SUFFIXES = ${serializedSuffixes};
  var ALLOWED_SUBSTRINGS = ${serializedSubstrings};
  var HIDDEN_CLASS = 'third-party-request-hidden';
  var URL_SELECTORS = ['.command-message-url', '.command-message-text', '.command-message', '.command-info'];

  function ensureStyles() {
    if (!document.head.querySelector('style[data-third-party-request-filter]')) {
      var style = document.createElement('style');
      style.setAttribute('data-third-party-request-filter', 'true');
      style.textContent = '.' + HIDDEN_CLASS + ' { display: none !important; }';
      document.head.appendChild(style);
    }
  }

  function extractUrl(text) {
    if (!text) {
      return null;
    }

    var match = String(text).match(/https?:\/\/[^\s"']+|\/\/[^\s"']+|\/[^\s"']+/);
    return match ? match[0] : null;
  }

  function findRequestUrl(node) {
    for (var i = 0; i < URL_SELECTORS.length; i++) {
      var candidate = node.querySelector(URL_SELECTORS[i]);
      if (candidate && candidate.textContent) {
        var url = extractUrl(candidate.textContent);
        if (url) {
          return url;
        }
      }
    }

    return extractUrl(node.textContent || '');
  }

  function resolveHostname(rawUrl) {
    if (!rawUrl) {
      return null;
    }

    try {
      return new URL(rawUrl, FIRST_PARTY_ORIGIN).hostname.toLowerCase();
    } catch (_) {
      return null;
    }
  }

  function isAllowedHost(hostname) {
    if (hostname === FIRST_PARTY_HOSTNAME) {
      return true;
    }

    for (var j = 0; j < ALLOWED_SUBSTRINGS.length; j++) {
      var pattern = ALLOWED_SUBSTRINGS[j];
      if (pattern && hostname.indexOf(pattern) !== -1) {
        return true;
      }
    }

    for (var i = 0; i < ALLOWED_HOST_SUFFIXES.length; i++) {
      var suffix = String(ALLOWED_HOST_SUFFIXES[i] || '').toLowerCase();
      if (!suffix) {
        continue;
      }

      if (hostname === suffix) {
        return true;
      }

      if (hostname.length > suffix.length && hostname.slice(-suffix.length - 1) === '.' + suffix) {
        return true;
      }
    }

    return false;
  }

  function processCommand(commandNode) {
    if (!(commandNode instanceof HTMLElement)) {
      return;
    }

    commandNode.classList.remove(HIDDEN_CLASS);

    var requestUrl = findRequestUrl(commandNode);
    if (!requestUrl) {
      return;
    }

    var hostname = resolveHostname(requestUrl);
    if (!hostname) {
      return;
    }

    if (!isAllowedHost(hostname)) {
      commandNode.classList.add(HIDDEN_CLASS);
    }
  }

  function processTree(root) {
    if (!(root instanceof HTMLElement)) {
      return;
    }

    if (root.classList.contains('command')) {
      processCommand(root);
    }

    var nestedCommands = root.querySelectorAll ? root.querySelectorAll('.command') : [];
    for (var i = 0; i < nestedCommands.length; i++) {
      processCommand(nestedCommands[i]);
    }
  }

  function observeContainer(container) {
    processTree(container);

    if (typeof MutationObserver !== 'function') {
      return null;
    }

    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        Array.prototype.forEach.call(mutation.addedNodes, processTree);
      });
    });

    observer.observe(container, { childList: true, subtree: true });
    return observer;
  }

  function initializeObservers() {
    ensureStyles();

    var containerObserver = null;
    var reporterObserver = null;

    function setContainerObserver(reporter) {
      var container = reporter.querySelector('.container');
      if (!container) {
        return false;
      }

      if (containerObserver) {
        containerObserver.disconnect();
      }

      containerObserver = observeContainer(container);
      return true;
    }

    function handleReporter(reporter) {
      if (!setContainerObserver(reporter)) {
        setTimeout(function () {
          handleReporter(reporter);
        }, 100);
      }

      if (typeof MutationObserver !== 'function') {
        return;
      }

      if (!reporterObserver) {
        reporterObserver = new MutationObserver(function (mutations) {
          var shouldReattach = false;

          mutations.forEach(function (mutation) {
            Array.prototype.forEach.call(mutation.addedNodes, function (node) {
              if (node instanceof HTMLElement) {
                if (node.classList.contains('container') || (node.querySelector && node.querySelector('.container'))) {
                  shouldReattach = true;
                }

                processTree(node);
              }
            });
          });

          if (shouldReattach) {
            setContainerObserver(reporter);
          }
        });

        reporterObserver.observe(reporter, { childList: true, subtree: true });
      }
    }

    (function locateReporter() {
      var reporter = document.querySelector('.reporter');
      if (!reporter) {
        setTimeout(locateReporter, 100);
        return;
      }

      handleReporter(reporter);
    })();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeObservers, { once: true });
  } else {
    initializeObservers();
  }
})();
`;
};

const resolveFirstPartyContext = (): { origin: string | null; hostname: string | null } => {
  const baseUrl = Cypress.config().baseUrl;

  if (typeof baseUrl === 'string' && baseUrl.trim().length > 0) {
    try {
      const parsedUrl = new URL(baseUrl);
      return { origin: parsedUrl.origin, hostname: parsedUrl.hostname.toLowerCase() };
    } catch (error) {
      console.warn('Third-party request filter not applied: unable to parse baseUrl.', error);
    }
  }

  return { origin: null, hostname: null };
};

const injectThirdPartyRequestFilter = (
  doc: Document,
  origin: string,
  hostname: string,
  allowedHostSuffixes: string[],
  allowedSubstringPatterns: string[]
): void => {
  if (!doc.head || !doc.body) {
    console.warn(
      'Third-party request filter not applied: top window missing document head or body.'
    );
    return;
  }

  const desiredConfig = JSON.stringify({
    origin,
    hostname,
    allowedHostSuffixes,
    allowedSubstringPatterns,
  });
  const currentConfig = doc.body.getAttribute('data-request-filter-config');

  if (currentConfig !== desiredConfig) {
    doc.body.setAttribute('data-request-filter-config', desiredConfig);
  }

  if (doc.head.querySelector('script[data-third-party-request-filter]')) {
    return;
  }

  const script = doc.createElement('script');
  script.setAttribute('data-third-party-request-filter', 'true');
  script.textContent = createFilterScript(
    origin,
    hostname,
    allowedHostSuffixes,
    allowedSubstringPatterns
  );
  doc.head.appendChild(script);
};

const { origin: firstPartyOrigin, hostname: firstPartyHostname } = resolveFirstPartyContext();

if (hideThirdPartyRequests && firstPartyOrigin && firstPartyHostname) {
  const resolveTopWindow = (): Window | null => {
    try {
      const candidate = window.top ?? window;
      void candidate.document;
      return candidate;
    } catch (error) {
      console.warn('Third-party request filter not applied: unable to access top window.', error);
      return null;
    }
  };

  const topWindow = resolveTopWindow();

  if (topWindow) {
    const allowedHostSuffixes = Cypress.env('firstPartyHostSuffixes');
    const allowedHostSubstrings = Cypress.env('firstPartyHostSubstrings');

    injectThirdPartyRequestFilter(
      topWindow.document,
      firstPartyOrigin,
      firstPartyHostname,
      Array.isArray(allowedHostSuffixes) ? (allowedHostSuffixes as string[]) : [],
      Array.isArray(allowedHostSubstrings) ? (allowedHostSubstrings as string[]) : []
    );
  }
}
