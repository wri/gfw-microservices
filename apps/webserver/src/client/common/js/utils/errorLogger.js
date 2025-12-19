/**
 * @name errorLogger.js
 * @description Centralized error logging utility for frontend applications
 * Provides structured logging with context, prevents data leakage in production,
 * and integrates with monitoring systems (CloudWatch/Sentry)
 */

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

/**
 * Check if we're in development environment
 * @returns {boolean}
 */
const isDevelopment = () => {
  return (
    process.env.NODE_ENV === 'development' ||
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
  );
};

/**
 * Sanitize sensitive data from objects before logging
 * @param {*} data - Data to sanitize
 * @returns {*} Sanitized data
 */
const sanitizeData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  const sensitiveKeys = ['password', 'token', 'apiKey', 'secret', 'authorization', 'cookie'];
  const sanitized = Array.isArray(data) ? [...data] : { ...data };

  Object.keys(sanitized).forEach((key) => {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some((sensitive) => lowerKey.includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  });

  return sanitized;
};

/**
 * Format error for logging
 * @param {Error|string} error - Error object or message
 * @param {Object} context - Additional context
 * @returns {Object} Formatted error
 */
const formatError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const sanitizedContext = sanitizeData(context);

  if (error instanceof Error) {
    return {
      timestamp,
      message: error.message,
      stack: isDevelopment() ? error.stack : undefined,
      name: error.name,
      ...sanitizedContext,
    };
  }

  return {
    timestamp,
    message: typeof error === 'string' ? error : JSON.stringify(error),
    ...sanitizedContext,
  };
};

/**
 * Send error to backend logging endpoint
 * @param {Object} formattedError - Formatted error object
 * @param {string} level - Log level
 */
const sendToBackend = async (formattedError, level) => {
  try {
    // Send to backend logging endpoint
    await fetch('/api/client-logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        level,
        ...formattedError,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
      // Don't wait for response, fire and forget
      keepalive: true,
    });
  } catch (err) {
    // Fail silently to avoid infinite loop
    // In development, at least show it in console
    if (isDevelopment()) {
      // eslint-disable-next-line no-console
      console.error('[errorLogger] Failed to send log to backend:', err);
    }
  }
};

/**
 * Send error to monitoring service (e.g., Sentry, Google Analytics)
 * @param {Object} formattedError - Formatted error object
 * @param {string} level - Log level
 */
const sendToMonitoring = (formattedError, level) => {
  try {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: formattedError.message,
        fatal: level === LOG_LEVELS.ERROR,
      });
    }
  } catch (err) {
    // Fail silently to avoid infinite loop
  }
};

/**
 * Core logging function
 * @param {string} level - Log level
 * @param {Error|string} error - Error object or message
 * @param {Object} context - Additional context
 */
const log = (level, error, context = {}) => {
  const formattedError = formatError(error, context);

  // In production: send to backend and monitoring services
  if (!isDevelopment()) {
    // Send to backend logging endpoint (async, non-blocking)
    sendToBackend(formattedError, level);
    
    // Send to monitoring services
    sendToMonitoring(formattedError, level);
  } else {
    // Development only: use console for immediate feedback
    // eslint-disable-next-line no-console
    const consoleMethod = console[level] || console.log;
    // eslint-disable-next-line no-console
    consoleMethod(`[${level.toUpperCase()}]`, formattedError);
  }
};

/**
 * Public API for error logging
 */
const errorLogger = {
  /**
   * Log error level messages
   * @param {Error|string} error - Error object or message
   * @param {Object} context - Additional context (component, action, user info, etc.)
   * @example
   * errorLogger.error(new Error('API call failed'), { component: 'UserProfile', action: 'fetchUser' })
   */
  error: (error, context = {}) => {
    log(LOG_LEVELS.ERROR, error, context);
  },

  /**
   * Log warning level messages
   * @param {Error|string} warning - Warning message
   * @param {Object} context - Additional context
   * @example
   * errorLogger.warn('Invalid data format', { component: 'DataTable', data: invalidData })
   */
  warn: (warning, context = {}) => {
    log(LOG_LEVELS.WARN, warning, context);
  },

  /**
   * Log info level messages (development only)
   * @param {string} message - Info message
   * @param {Object} context - Additional context
   * @example
   * errorLogger.info('User logged in', { userId: user.id, timestamp: Date.now() })
   */
  info: (message, context = {}) => {
    if (isDevelopment()) {
      log(LOG_LEVELS.INFO, message, context);
    }
  },

  /**
   * Log debug level messages (development only)
   * @param {string} message - Debug message
   * @param {Object} context - Additional context
   * @example
   * errorLogger.debug('Component rendered', { component: 'MyComponent', props })
   */
  debug: (message, context = {}) => {
    if (isDevelopment()) {
      log(LOG_LEVELS.DEBUG, message, context);
    }
  },

  /**
   * Log API errors with structured information
   * @param {Error} error - Error object from API call
   * @param {Object} apiContext - API-specific context
   * @example
   * errorLogger.apiError(error, { endpoint: '/api/users', method: 'GET', status: 500 })
   */
  apiError: (error, apiContext = {}) => {
    const context = {
      ...apiContext,
      category: 'API_ERROR',
    };
    log(LOG_LEVELS.ERROR, error, context);
  },

  /**
   * Log component errors (useful for React error boundaries)
   * @param {Error} error - Error object
   * @param {Object} errorInfo - React error info
   * @param {string} componentName - Name of the component
   * @example
   * errorLogger.componentError(error, errorInfo, 'UserProfile')
   */
  componentError: (error, errorInfo, componentName) => {
    const context = {
      component: componentName,
      componentStack: isDevelopment() ? errorInfo.componentStack : undefined,
      category: 'COMPONENT_ERROR',
    };
    log(LOG_LEVELS.ERROR, error, context);
  },
};

export default errorLogger;
