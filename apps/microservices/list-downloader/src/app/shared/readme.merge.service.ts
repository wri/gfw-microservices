import { Injectable, Logger, Scope } from '@nestjs/common';
import * as fs from 'fs';
import readline = require('readline');

@Injectable({
  scope: Scope.REQUEST,
})
export class ReadmeMergeServices {
  private readonly logger = new Logger(ReadmeMergeServices.name);
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
  async processFiles(
    files: string[],
    newHeader: string,
    outputFilePath: string,
    listName: string
  ): Promise<string | void> {
    try {
      this.logger.log('Combining README files');
      // Check if at least one file is provided
      if (files.length === 0) {
        this.logger.warn('Please provide at least one file.');
        return '';
      }
      // Writing the result to an output file
      const outputFile = `${outputFilePath}/README.csv`;

      fs.writeFileSync(outputFile, newHeader + '\n');
      // Store all lines and headers from all files
      const allLines: string[] = [];
      let oldHeader = '';
      // Process each file
      for (const filePath of files) {
        // Ensures that the file path is a string before try to read it
        if (typeof filePath === 'string') {
          const lines = await ReadmeMergeServices.readCSV(filePath);

          // If newHeader is not set, set it from the first file
          if (!newHeader) {
            newHeader = lines[0]; // Header from the first file
          }
          // Add old Header
          if (oldHeader.length < lines[0].length) {
            oldHeader = lines[0];
            fs.appendFileSync(`${outputFilePath}/README.csv`, lines[0] + '\n');
          }
          // Add all lines except the header
          allLines.push(...lines.slice(1));
        }
      }
      // Create a Set to store unique lines (eliminating duplicates)
      const uniqueLines = new Set<string>();

      // Add all lines ensuring uniqueness
      allLines.forEach((line) => {
        uniqueLines.add(line);
      });

      for (const line of uniqueLines) {
        // Replace with the list name
        const updatedLine = line.replace(/Test List|<LISTNAME>/g, listName.replace(/ /g, '_'));
        fs.appendFileSync(`${outputFilePath}/README.csv`, updatedLine + '\n');
      }

      this.logger.log(`CSV result file generated successfully: ${outputFile}`);
      return outputFile;
    } catch (error) {
      this.logger.error('Error processing CSV files:', error);
    }
  }
}
