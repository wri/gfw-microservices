import  *  as  winston  from  'winston';
import  'winston-daily-rotate-file';

//Label
const CATEGORY = "TASKS";

const customFormat = winston.format.printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

//DailyRotateFile func()
const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: "logs/rotate-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
});

export const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(winston.format.label({ label: CATEGORY }), winston.format.timestamp(), customFormat),
  transports: [fileRotateTransport, new winston.transports.Console()],
});

/**
 * @function createErrorMessage
 * @summary Creates a new standard error message object that can be used across.
 * @param {int} errorCode - Error Code used for identifying the error.
 * @param {String} userMessage - A message that could be provided to the user if necessary.
 * @param {String} systemMessage - The more detailed system message for logging or debugging.
 * @return {Object} An error message object containing the above parameters.
 */
 export const createErrorMessage = (errorCode: number, userMsg: string, systemMsg: string) => {
  const objError = {
    errorCode,
    userMessage: userMsg,
    systemMessage: systemMsg,
  };

  logger.error(objError);
  return objError;
};

export const errorCodes = {
  failedToGetList: 604,
};

