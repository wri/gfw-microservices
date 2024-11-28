import { Injectable, Logger, Scope } from '@nestjs/common';
import * as fs from 'fs';
import readline = require('readline');

@Injectable({
  scope: Scope.REQUEST,
})
export class CSVServices {
  private readonly logger = new Logger(CSVServices.name);
  // Method to read a CSV file and return its lines as an array
  static async readCSV(file: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const lines: string[] = [];
      const stream = fs.createReadStream(file);
      const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
      });

      rl.on('line', (line) => {
        lines.push(line);
      });

      rl.on('close', () => {
        resolve(lines);
      });

      rl.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Method to process multiple CSV files, remove duplicates and generate the output file
  async processFiles(files: string[], newHeader: string): Promise<string> {
    try {
      // Check if at least one file is provided
      if (files.length === 0) {
        this.logger.warn('Please provide at least one file.');
        return;
      }

      // Store all lines and headers from all files
      const allLines: string[] = [];

      // Process each file
      for (const file of files) {
        const lines = await CSVServices.readCSV(file);

        // If newHeader is not set, set it from the first file
        if (!newHeader) {
          newHeader = lines[0]; // Header from the first file
        }

        // Add all lines except the header
        allLines.push(...lines.slice(1));
      }

      // Create a Set to store unique lines (eliminating duplicates)
      const uniqueLines = new Set<string>();

      // Add all lines ensuring uniqueness
      allLines.forEach((line) => {
        uniqueLines.add(line);
      });

      // Writing the result to an output file
      const outputFile = `README.csv`;
      const writeStream = fs.createWriteStream(outputFile);

      // Write the header
      writeStream.write(newHeader + '\n');

      // Write all unique lines
      for (const line of uniqueLines) {
        writeStream.write(line + '\n');
      }

      this.logger.log(`CSV result file generated successfully: ${outputFile}`);
      return outputFile;
    } catch (error) {
      this.logger.error('Error processing CSV files:', error);
    }
  }
}
