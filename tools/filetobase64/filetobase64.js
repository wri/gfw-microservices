const fileInput = '';
const fileOutput = './base64file.txt';
const fs = require('fs');
const fileBuffer = fs.readFileSync(fileInput);
const base64String = fileBuffer.toString('base64');
fs.writeFileSync(fileOutput, base64String, 'utf8');
