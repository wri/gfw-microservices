const fs = require('fs');
const child_process = require('child_process');
// const Math = require('mathjs');

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
parser.addArgument(['-a', '--attributes'], { action: 'storeTrue', help: 'Random attributes' });
const args = parser.parseArgs();

const locations = args.locations ? Math.round(Number(args.locations)) : defaultLocations;
const radius = args.radius ? Number(args.radius) : defaultRadius;
const format = args.format || defaultFormat;
const polygon = args.polygon;
const attributes = args.attributes;

function outputHeader(fileName) {
  let headerString = '';
  if (format === 'CSV') {
    headerString = 'Location Name,Latitude,Longitude,Analysis Radius,Analysis Area';
    if (attributes) {
      headerString += ',Attr bC 1';
    }
    headerString += '\n';
    if (polygon) {
      throw new Error('Polygon not supported for CSV');
    }
  } else if (format === 'KML') {
    headerString = `<?xml version="1.0" encoding="utf-8" ?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document id="root_doc">
<Schema name="pro_kml_schema" id="pro_kml_schema">
<SimpleField name="Location Name" type="string"></SimpleField>
<SimpleField name="Analysis Radius" type="string"></SimpleField>\n`;
    if (attributes) {
      headerString += '<SimpleField name="Attr bC 1" type="string"></SimpleField>\n';
    }
    headerString += `</Schema>
<Folder><name>pro_kml_schema</name>`;
  } else if (format === 'GeoJson') {
    headerString = `{
      "type": "FeatureCollection",
      "features": [\n`;
  } else {
    throw new Error('unsupported format', format);
  }
  fs.writeFileSync(fileName, headerString);
}

/**
 * Generates coordinates for a star-shaped polygon with alternating inner and outer radii.
 *
 * @param {number} lat - Latitude of the polygon center.
 * @param {number} lon - Longitude of the polygon center.
 * @param {number} numPoints - Number of points (vertices) for the polygon.
 * @returns {Array<Array<number>>} Array of [lon, lat] coordinates representing the polygon vertices.
 */
function genPolygonCoords(lat, lon, numPoints) {
  const outerRadius = 0.004;
  const innerRadius = 0.001;
  const coordinates = [];

  for (let i = 0; i <= numPoints; i++) {
    const angle = (i * 2 * Math.PI) / numPoints;
    const r = i % 2 === 0 ? outerRadius : innerRadius;
    const pointLon = lon + r * Math.cos(angle);
    const pointLat = lat + r * Math.sin(angle);
    coordinates.push([pointLon, pointLat]);
  }

  return coordinates;
}

function outputLocation(fileName, locName, lat, lon) {
  let locString = '';
  try {
    const coordinates = genPolygonCoords(lat, lon, 100);
    const randomAttr = `A${Math.random().toString().slice(2, 5)}`;
    if (format === 'CSV') {
      locString = `${locName},${lat},${lon},${radius},`;
      if (attributes) {
        locString += ',' + randomAttr;
      }
      locString += '\n';
    } else if (format === 'KML') {
      locString = `  <Placemark>
	<Style><LineStyle><color>ff0000ff</color></LineStyle><PolyStyle><fill>0</fill></PolyStyle></Style>
	<ExtendedData><SchemaData schemaUrl="#pro_kml_schema">
		<SimpleData name="Location Name">${locName}</SimpleData>`;
      locString += polygon ? '' : `<SimpleData name="Analysis Radius">${radius}</SimpleData>`;
      if (attributes) {
        locString += `\n<SimpleData name="Attr bC 1">${randomAttr}</SimpleData>`;
      }
      locString += '</SchemaData></ExtendedData>\n';
      if (polygon) {
        locString += `<Polygon><outerBoundaryIs><LinearRing><coordinates>
          ${coordinates.map((coord) => coord.join(',') + ',0').join(' ')}
          </coordinates></LinearRing></outerBoundaryIs></Polygon>`;
      } else {
        locString += `<Point><coordinates>${lon},${lat},0</coordinates></Point>`;
      }
      locString += '</Placemark>\n';
    } else if (format === 'GeoJson') {
      if (locName !== 'Loc 0 0') {
        locString = ',';
      }
      locString += `      {
        "type": "Feature",
        "properties": {"Location Name": "${locName}"`;
      locString += polygon ? '' : `,"Analysis Radius": ${radius},"Analysis Area": 0`;
      if (attributes) {
        locString += `,"Attr bC 1": "${randomAttr}"`;
      }
      locString += '},\n';
      if (polygon) {
        locString += `        "geometry": {
          "type": "Polygon",
          "coordinates": [[
            [${coordinates.map((coord) => coord.join(',')).join('], [')}]
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
      const locName = `Loc ${x} ${y}`;
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
    `python ${__dirname}/genLocShp.py -l ${locations} ${polygon ? '-g' : ''} ${
      attributes ? '-a' : ''
    }`
  );
  console.log(childOutput.toString());
} else if (format !== 'CSV' && format !== 'KML' && format !== 'GeoJson') {
  console.error('Unsupported format:', format);
  process.exit(1);
} else {
  genLocs(locations);
}
