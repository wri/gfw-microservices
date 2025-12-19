/**
 * @name clientLogs.routes.js
 * @description Routes for handling client-side error logging
 * Receives logs from frontend errorLogger utility and forwards to Winston
 */

const logger = require('../../../config/privateutils/logger.utils');

/**
 * Validate and sanitize client log data
 */
const validateClientLog = (logData) => {
  const { level, message, timestamp, ...context } = logData;
  
  // Validate required fields
  if (!level || !message) {
    return { isValid: false, error: 'Missing required fields: level, message' };
  }

  // Validate log level
  const validLevels = ['error', 'warn', 'info', 'debug'];
  if (!validLevels.includes(level)) {
    return { isValid: false, error: 'Invalid log level' };
  }

  // Sanitize and limit context size (prevent DOS)
  const sanitizedContext = JSON.stringify(context).substring(0, 5000);
  
  return {
    isValid: true,
    sanitizedLog: {
      level,
      message: String(message).substring(0, 1000), // Limit message size
      timestamp: timestamp || new Date().toISOString(),
      context: JSON.parse(sanitizedContext),
    },
  };
};

/**
 * @name exports
 * @static
 * @summary Client-side logging routes
 */
module.exports = (app) => {
  /**
   * @route POST /api/client-logs
   * @description Receive client-side logs and forward to Winston
   * @access Public (but should be rate-limited)
   */
  app.post('/api/client-logs', (req, res) => {
    try {
      const validation = validateClientLog(req.body);
      
      if (!validation.isValid) {
        return res.status(400).json({ error: validation.error });
      }

      const { level, message, timestamp, context } = validation.sanitizedLog;

      // Add metadata about the client
      const logMetadata = {
        source: 'client',
        timestamp,
        userAgent: req.headers['user-agent'],
        ip: req.ip || req.connection.remoteAddress,
        ...context,
      };

      // Log using Winston with appropriate level
      logger[level](`[CLIENT] ${message}`, logMetadata);

      // Respond with minimal data (don't leak info)
      res.status(204).send();
    } catch (err) {
      // Don't expose internal errors to client
      logger.error('Error processing client log', {
        error: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  /**
   * @route POST /api/client-logs/batch
   * @description Receive multiple client-side logs in one request
   * @access Public (but should be rate-limited)
   */
  app.post('/api/client-logs/batch', (req, res) => {
    try {
      const { logs } = req.body;

      if (!Array.isArray(logs)) {
        return res.status(400).json({ error: 'logs must be an array' });
      }

      // Limit batch size to prevent abuse
      const maxBatchSize = 50;
      const logsToProcess = logs.slice(0, maxBatchSize);

      let processedCount = 0;
      let errorCount = 0;

      logsToProcess.forEach((logData) => {
        const validation = validateClientLog(logData);
        
        if (validation.isValid) {
          const { level, message, timestamp, context } = validation.sanitizedLog;
          
          logger[level](`[CLIENT] ${message}`, {
            source: 'client',
            timestamp,
            userAgent: req.headers['user-agent'],
            ip: req.ip || req.connection.remoteAddress,
            ...context,
          });
          
          processedCount++;
        } else {
          errorCount++;
        }
      });

      res.status(200).json({
        processed: processedCount,
        errors: errorCount,
      });
    } catch (err) {
      logger.error('Error processing client log batch', {
        error: err.message,
        stack: err.stack,
      });
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};
