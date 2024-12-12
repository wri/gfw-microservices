import { z } from 'zod';

const mapStringsToArrayHelper = (currentParam) => {
  try {
    const parsed = JSON.parse(currentParam);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [parsed];
  } catch (e) {
    // If parsing fails, it's not an Admin Areas
    return currentParam.split(',').map((item) => {
      const num = Number(item);
      return isNaN(num) ? item.trim() : num;
    });
  }
};

const QueryParamsValidationSchema = z.object({
  listId: z.coerce.number().optional(),
  selectedLocations: z.string().transform(mapStringsToArrayHelper).optional(),
  visibleLayers: z.string().transform(mapStringsToArrayHelper).optional(),
  locationId: z.coerce.number().optional(),
  // https://github.com/colinhacks/zod/issues/2985
  isGfwList: z
    .string()
    .transform((x) => x === 'true')
    .pipe(z.boolean())
    .optional(),
  isSharedList: z
    .string()
    .transform((x) => x === 'true')
    .pipe(z.boolean())
    .optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  zoom: z.coerce.number().optional(),
  selectedTimeframe: z.string().optional(),
  xmin: z.coerce.number().optional(),
  ymin: z.coerce.number().optional(),
  xmax: z.coerce.number().optional(),
  ymax: z.coerce.number().optional(),
});

export const parseSearchParams = (queryString) => {
  const urlSearchParams = new URLSearchParams(queryString);
  const queryObj = Object.fromEntries(urlSearchParams.entries());

  const validParams = QueryParamsValidationSchema.parse(queryObj);

  // feat [GPV-3376]: external route `/apimap` uses locationId, set selectedLocations to trigger zoom for that
  if (validParams.locationId && window.location.pathname === '/apimap') {
    validParams.selectedLocations = [validParams.locationId];
  }

  return validParams;
};

const getQueryParams = (queryString) => {
  const queryParams = new URLSearchParams(queryString);
  const params = {};

  // Define the expected data types for the keys
  const keyTypes = {
    visibleLayers: 'array',
    listId: 'number',
    selectedLocations: 'array-int-or-string',
    locationId: 'array-int-or-string',
    isGfwList: 'boolean',
    isSharedList: 'boolean',
    latitude: 'number',
    longitude: 'number',
    zoom: 'number',
    selectedTimeframe: 'string',
    xmin: 'number',
    ymin: 'number',
    xmax: 'number',
    ymax: 'number',
  };

  // Store the type separately from the params object
  const arrayIntOrStringTypes = {};

  queryParams.forEach((value, key) => {
    if (key in keyTypes) {
      switch (keyTypes[key]) {
        case 'array':
          if (!params[key]) params[key] = [];
          params[key].push(value);
          break;
        case 'array-int-or-string':
          if (!params[key]) {
            params[key] = [];
            // Determine type based on the first element
            arrayIntOrStringTypes[key] = isNaN(value) ? 'string' : 'int';
          }
          params[key].push(arrayIntOrStringTypes[key] === 'int' ? parseInt(value, 10) : value);
          break;
        case 'number':
          params[key] = parseFloat(value);
          break;
        case 'boolean':
          params[key] = value === 'true';
          break;
        default:
          params[key] = value;
      }
    }
  });

  // TODO GPV-3508 when locations are selected and the user wants to see the map with those locations, send zoom param: `zoom=1|2`
  // Workaround for makes zoom work at apimap route, zoom requires the selectedLocations attribute, and apimap route only sends locationId
  if (params['locationId']) {
    params['selectedLocations'] = params['locationId'];
    params['isSharedList'] = false;
    delete params['locationId'];
  }

  return params;
};

export default getQueryParams;
