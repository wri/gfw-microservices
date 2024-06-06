import * as d3Dsv from 'd3-dsv/dist/d3-dsv';
import sexagesimal from '@mapbox/sexagesimal';

const latRegex = /(Lat)(itude)?/gi;
const lonRegex = /(L)(on|ng)(gitude)?/i;

interface Row {
  [key: string]: any;
}

interface GeometryPoint {
  type: 'Point';
  coordinates: [number, number];
}

interface ParseError {
  message: string;
  row: Row;
  index: number;
}

export interface CSVParseOptions {
  delimiter?: string;
  latfield?: string;
  lonfield?: string;
  numericFields?: string;
  includeLatLon?: boolean;
}

type KeyValuePair = {
  [key: string]: string | number | GeometryPoint | null | undefined;
};

function guessHeader(row: Row, regexp: RegExp): string | undefined {
  let name: string | undefined;
  let match: RegExpMatchArray | null;
  let score = 0;

  for (const f in row) {
    match = f.match(regexp);
    if (match && (!name || match[0].length / f.length > score)) {
      score = match[0].length / f.length;
      name = f;
    }
  }
  return name;
}

function guessLatHeader(row: Row): string | undefined {
  return guessHeader(row, latRegex);
}

function guessLonHeader(row: Row): string | undefined {
  return guessHeader(row, lonRegex);
}

function keyCount(o: any): number {
  return typeof o === 'object' ? Object.keys(o).length : 0;
}

function autoDelimiter(x: string): string | null {
  const delimiters = [',', ';', '\t', '|'];
  const results: { delimiter: string; arity: number }[] = [];

  delimiters.forEach((delimiter) => {
    const res = d3Dsv.dsvFormat(delimiter).parse(x);
    if (res.length >= 1) {
      const count = keyCount(res[0]);
      for (let i = 0; i < res.length; i++) {
        if (keyCount(res[i]) !== count) return;
      }
      results.push({
        delimiter,
        arity: Object.keys(res[0]).length,
      });
    }
  });

  if (results.length) {
    return results.sort((a, b) => b.arity - a.arity)[0].delimiter;
  } else {
    return null;
  }
}

export function csv2geojson(csvContent: string, options: CSVParseOptions): [any, any[]] {
  options.delimiter = options.delimiter || ',';

  let latfield = options.latfield || '';
  let lonfield = options.lonfield || '';

  const features: KeyValuePair[] = [];
  const featurecollection = { type: 'FeatureCollection', features };

  if (options.delimiter === 'auto' && typeof csvContent === 'string') {
    options.delimiter = autoDelimiter(csvContent);
    if (!options.delimiter) {
      throw new Error('Could not autodetect delimiter');
    }
  }

  const numericFields = options.numericFields ? options.numericFields.split(',') : null;

  const parsed =
    typeof csvContent === 'string'
      ? d3Dsv.dsvFormat(options.delimiter).parse(csvContent, (d) => {
          if (numericFields) {
            for (const key in d) {
              if (numericFields.includes(key)) {
                d[key] = +d[key];
              }
            }
          }
          return d;
        })
      : csvContent;

  if (!parsed.length) {
    return [featurecollection, []];
  }

  const errors: ParseError[] = [];
  let i: number;

  if (!latfield) latfield = guessLatHeader(parsed[0])!;
  if (!lonfield) lonfield = guessLonHeader(parsed[0])!;
  const noGeometry = !latfield || !lonfield;

  if (noGeometry) {
    for (i = 0; i < parsed.length; i++) {
      features.push({
        type: 'Feature',
        properties: parsed[i],
        geometry: null,
      });
    }
    return [featurecollection, errors];
  }

  for (i = 0; i < parsed.length; i++) {
    if (parsed[i][lonfield] !== undefined && parsed[i][latfield] !== undefined) {
      let lonk = parsed[i][lonfield];
      let latk = parsed[i][latfield];
      let a: any;

      a = sexagesimal(lonk, 'EW');
      if (a) lonk = a;
      a = sexagesimal(latk, 'NS');
      if (a) latk = a;

      const lonf = parseFloat(lonk);
      const latf = parseFloat(latk);

      if (isNaN(lonf) || isNaN(latf)) {
        errors.push({
          message: 'A row contained an invalid value for latitude or longitude',
          row: parsed[i],
          index: i,
        });
      } else {
        if (!options.includeLatLon) {
          delete parsed[i][lonfield];
          delete parsed[i][latfield];
        }

        features.push({
          type: 'Feature',
          properties: parsed[i],
          geometry: {
            type: 'Point',
            coordinates: [lonf, latf],
          },
        });
      }
    }
  }

  return [featurecollection, errors];
}
