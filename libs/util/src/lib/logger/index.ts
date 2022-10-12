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