const fs = require('fs');
const child_process = require('child_process');

// Define default values for parameters
const defaultLocations = 4;
const defaultRadius = 0.1;
const defaultFormat = 'CSV';

process.on('exit', function (code) {
  return console.log(`Exited with code ${code}`);
});

const { ArgumentParser } = require('argparse');
const parser = new ArgumentParser({
  description: 'Generate CSV or KML file with locations',
});
parser.addArgument(['-l', '--locations'], { help: 'Number of locations to generate' });
parser.addArgument(['-r', '--radius'], { help: 'Radius of analysis' });
parser.addArgument(['-f', '--format'], { help: 'Output format: CSV, KML, GeoJson, SHP' });
parser.addArgument(['-g', '--polygon'], { action: 'storeTrue', help: 'Polygon vs point' });
const args = parser.parseArgs();

const locations = args.locations ? Math.round(Number(args.locations)) : defaultLocations;
const radius = args.radius ? Number(args.radius) : defaultRadius;
const format = args.format || defaultFormat;
const polygon = args.polygon;

function outputHeader(fileName) {
  let headerString = '';
  if (format === 'CSV') {
    headerString = 'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area\n';
    if (polygon) {
      throw new Error('Polygon not supported for CSV');
    }
  } else if (format === 'KML') {
    headerString = `<?xml version="1.0" encoding="utf-8" ?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document id="root_doc">
<Schema name="pro_kml_schema" id="pro_kml_schema">
<SimpleField name="Location Name" type="string"></SimpleField>
<SimpleField name="Analysis_R" type="string"></SimpleField>
</Schema>
<Folder><name>pro_kml_schema</name>`;
    /* <SimpleField name="Latitude" type="float"></SimpleField>
<SimpleField name="Longitude" type="float"></SimpleField>
<SimpleField name="Analysis_A" type="string"></SimpleField> */
  } else if (format === 'GeoJson') {
    headerString = `{
      "type": "FeatureCollection",
      "features": [\n`;
  } else {
    throw new Error('unsupported format', format);
  }
  fs.writeFileSync(fileName, headerString);
}

function outputLocation(fileName, locName, lat, lon) {
  let locString = '';
  try {
    if (format === 'CSV') {
      locString = `${locName},${lat},${lon},${radius},\n`;
    } else if (format === 'KML') {
      locString = `  <Placemark>
	<Style><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
	<ExtendedData><SchemaData schemaUrl="#pro_kml_schema">
		<SimpleData name="Location Name">${locName}</SimpleData>`;
      locString += polygon ? '' : `<SimpleData name="Analysis_R">${radius}</SimpleData>`;
      // <SimpleData name="Latitude">${lat}</SimpleData>
      // <SimpleData name="Longitude">${lon}</SimpleData>
      locString += '</SchemaData></ExtendedData>';
      if (polygon) {
        locString += `<Polygon><outerBoundaryIs><LinearRing><coordinates>
        ${lon - 0.01},${lat - 0.01},0
        ${lon - 0.01},${lat + 0.01},0
        ${lon + 0.01},${lat + 0.01},0
        ${lon + 0.01},${lat - 0.01},0
        ${lon - 0.01},${lat - 0.01},0
        </coordinates></LinearRing></outerBoundaryIs></Polygon>`;
      } else {
        locString += `<Point><coordinates>${lon},${lat},0</coordinates></Point>`;
      }
      locString += '</Placemark>\n';
    } else if (format === 'GeoJson') {
      if (locName !== 'Loc0_0') {
        locString = ',';
      }
      locString += `        {
        "type": "Feature",
        "properties": {"Location Name": "${locName}"`;
      locString += polygon ? '},\n' : `,"Analysis Radius": ${radius}},\n`;
      if (polygon) {
        locString += `        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [${lon - 0.01},${lat - 0.01}],
            [${lon - 0.01},${lat + 0.01}],
            [${lon + 0.01},${lat + 0.01}],
            [${lon + 0.01},${lat - 0.01}],
            [${lon - 0.01},${lat - 0.01}]
          ]]
        }`;
      } else {
        locString += `        "geometry": {
          "type": "Point",
          "coordinates": [${lon},${lat}]
        }`;
      }
      locString += '}\n';
    } else {
      throw new Error('unsupported format', format);
    }
    fs.appendFileSync(fileName, locString);
  } catch (error) {
    console.error('Output location error:', error.stack || error);
  }
}

function outputFooter(fileName) {
  try {
    if (format === 'CSV') {
      return;
    } else if (format === 'KML') {
      fs.appendFileSync(fileName, '</Folder></Document></kml>');
    } else if (format === 'GeoJson') {
      fs.appendFileSync(fileName, ']}');
    } else {
      throw new Error('unsupported format', format);
    }
  } catch (error) {
    console.error('Output footer error:', error.stack || error);
  }
}

const startLat = -13.0;
const startLon = 14.0;

// Function to generate data for locations
function genLocs(inputlocations) {
  const numPoints = Math.ceil(Math.sqrt(inputlocations));
  const numLocations = numPoints * numPoints;
  const fileExtension =
    format === 'CSV' ? 'csv' : format === 'KML' ? 'kml' : format === 'GeoJson' ? 'geojson' : 'xxx';
  const fileNameLoc = `CG${numLocations}`;
  const fileName = fileNameLoc + '.' + fileExtension;
  console.log(`Generating ${numLocations} locations (${numPoints} points^2) into file ${fileName}`);

  outputHeader(fileName);
  let lastLogPoints = 0;
  for (let x = 0; x < numPoints; x++) {
    for (let y = 0; y < numPoints; y++) {
      const lat = startLat + y * 0.036;
      const lon = startLon + x * 0.036;
      const locName = `Loc${x}_${y}`;
      outputLocation(fileName, locName, lat, lon);
    }
    if (((x - lastLogPoints) * 100) / numPoints >= 10) {
      lastLogPoints = x;
      console.log(`Done with ${x} of ${numPoints}: ${Math.round((x * 100) / numPoints)}%`);
    }
  }
  outputFooter(fileName);
  console.log('Done with all points');
}

if (format === 'SHP') {
  const childOutput = child_process.execSync(
    `python ${__dirname}/genLocShp.py -l ${locations} ${polygon ? '-g' : ''}`
  );
  console.log(childOutput.toString());
} else if (format !== 'CSV' && format !== 'KML' && format !== 'GeoJson') {
  console.error('Unsupported format:', format);
  process.exit(1);
} else {
  genLocs(locations);
}
