/**
 * @summary inserts log into logs table
 * @param {string} logDate
 * @param {string} level
 * @param {string} message
 */
export const insertLog = `INSERT INTO NodeLogs (LogDate, Level, Message) VALUES
  (@logDate, @level, @message)`;
