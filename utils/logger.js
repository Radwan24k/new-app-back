const fs = require('fs');
const path = require('path');

const logErrorToFile = (error, statusCode = 500) => {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const logDir = path.join(__dirname, '../logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }
  const logFilePath = path.join(logDir, `${dateStr}.log`);
  const logMessage = `${now.toISOString()} | Status: ${statusCode} | ${error}\n`;
  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Failed to write to log file:', err);
    }
  });
};

module.exports = logErrorToFile;
