import * as shapefile from 'shapefile';
import csvWriter from 'csv-write-stream';
import * as fs from 'fs';
import * as path from 'path';

// --- Configuration ---
// Set the path to your input .shp file
const inputShpPath = './gfw_universal_mill_list.shp';
// Set the path for the output .csv file
const outputCsvPath = './processed_data.csv';

/** ****************************************************************************
 * npx ts-node ./small_lists_prepare_data.ts
 ******************************************************************************/

/**
 * The main function to process the shapefile and output a CSV.
 */
async function processShapefile() {
  try {
    let effectivePath = inputShpPath;
    // 1. Check if the input file exists
    if (!fs.existsSync(inputShpPath)) {
      console.error(`❌ Error: Input file not found at ${inputShpPath}`);
      return;
    }
    // Handle case where input path is a directory containing the .shp file
    if (fs.statSync(inputShpPath).isDirectory()) {
      const files = fs.readdirSync(inputShpPath);
      const shpFile = files.find((file) => path.extname(file).toLowerCase() === '.shp');

      if (!shpFile) {
        console.error(`❌ Error: No .shp file found in directory: ${inputShpPath}`);
        return;
      }
      effectivePath = path.join(inputShpPath, shpFile);
    }

    // Ensure output directory exists
    const outputDir = path.dirname(outputCsvPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    console.log(`🔵 Reading shapefile from: ${effectivePath}`);

    // 2. Read the shapefile and convert it to a GeoJSON object
    const geojson = await shapefile.read(effectivePath);
    console.log('✔️ Shapefile read successfully. Processing features...');

    // 3. Modify the properties of each feature
    let featuresProcessed = 0;
    const records = geojson.features
      .map((feature) => {
        const props = feature.properties;

        if (!props) {
          return;
        }

        if (props.hasOwnProperty('mill_name')) {
          props['Location Name'] = props['mill_name'];
          delete props['mill_name'];
        }

        if (props.hasOwnProperty('rspo_type')) {
          props['Rspo Type'] = props['rspo_type'];
          delete props['rspo_type'];
        }

        props['Analysis Radius'] = 50; // default value

        featuresProcessed++;
        return props; // Return the modified properties
      })
      .filter(Boolean); // Filter out any undefined/null entries

    console.log(`✔️ ${featuresProcessed} features were processed.`);

    // 4. Convert the feature properties to CSV and write to a file
    if (records.length > 0) {
      console.log(`🔵 Converting attribute data to CSV...`);

      const writer = csvWriter();
      const writeStream = fs.createWriteStream(outputCsvPath);
      writer.pipe(writeStream);
      records.forEach((record) => {
        writer.write(record);
      });

      writer.end();

      console.log(`✅ Success! The new CSV file has been created at: ${outputCsvPath}`);
    } else {
      console.warn('⚠️ Warning: Shapefile contained no features. No CSV file was created.');
    }
  } catch (error) {
    console.error('❌ An error occurred during processing:', error);
  }
}

processShapefile();
