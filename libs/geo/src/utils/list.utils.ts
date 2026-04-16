import { Logger } from '@nestjs/common';
import {
  SQLUtils,
  GetTableAnalysisColumnsById,
  UnlockList,
  ListsAnalysisStatus,
  ClientStoreConnection,
  AnalysisSchema,
} from '@wri-monorepos/sql';
import { ListBulkCopy } from './ListBulkCopy';
import * as sql from 'mssql';
import { listStatus, analysisTypes, AlertsAnalysisFrequency } from '@wri-monorepos/constants';
import { featureFlagsService } from '@wri-monorepos/shared';

const LIST_STATUS = {
  LIST_STATUS_PENDING: 1,
  LIST_STATUS_ACTIVE: 2,
  LIST_STATUS_INACTIVE: 3,
  LIST_STATUS_DRAFT: 4,
  LIST_STATUS_ANALYZING_DIAGNOSTIC: 5,
  LIST_STATUS_ANALYZING_DASHBOARD: 6,
};
export const ContainsPunctuation = (list_name) => {
  return list_name.search(/[^A-Za-z0-9\s]/) > -1;
};

/**
 * Get List Status ID
 *
 * @param {boolean} isSaveAsDraft - Is save as Draft (true/false)
 * @return {number} - List status ID (eg. Pending = 1 || Draft = 4)
 */
export function getListStatusId(isSaveAsDraft) {
  return isSaveAsDraft ? LIST_STATUS.LIST_STATUS_DRAFT : LIST_STATUS.LIST_STATUS_PENDING;
}

export const discernPropValue = (feature, prop) => {
  let propValue = feature[prop];
  if (prop === 'Accuracy Rating of Location Entered') {
    if (typeof propValue !== 'undefined' && propValue?.toLowerCase) {
      switch (propValue.toLowerCase()) {
        case "don't know":
          propValue = 0;
          break;
        case 'dont know':
          propValue = 0;
          break;
        case 'not confident':
          propValue = 1;
          break;
        case 'moderately confident':
          propValue = 2;
          break;
        case 'very confident':
          propValue = 3;
          break;
        default:
          propValue = 0;
      }
    } else {
      propValue = 0;
    }
  } else if (prop === 'Size of Investment') {
    if (propValue === '') {
      propValue = null;
    }
  }

  return propValue;
};

/**
 * Not deprecated but not used anywhere
 */
export function getActiveTye(commodityType: string, currentActiveTye: string) {
  if (commodityType === 'palmOil') {
    return 'palmGeneric';
  } else if (commodityType === 'soy') {
    return 'soyGeneric';
  } else if (commodityType === 'cattle') {
    return 'cattleGeneric';
  } else if (commodityType === 'cocoa') {
    return 'cocoaGeneric';
  }

  return currentActiveTye;
}

export function getCustomAttributeNamesAndGenericFields(customAttributes: string, templateData) {
  const customAttributeNames = customAttributes.length > 0 ? customAttributes.split(',') : [];
  const genericFields = [];

  templateData.forEach((template) => {
    // Only specify custom attributes if the field name has been changed.
    if (
      template.template_datum_field_name_updated &&
      template.template_datum_field_name_updated !== template.template_datum_field_name
    ) {
      customAttributeNames.push(template.template_datum_field_name_updated);
    } else {
      genericFields.push(template.template_datum_field_name);
    }
  });

  return [customAttributeNames, genericFields];
}

export function createfeaturePropsForCommodity(locationData, customAttributeNames, genericFields) {
  const featProps = [];
  locationData.forEach((feature) => {
    const properties = {};
    Object.keys(feature).forEach((prop) => {
      if (
        prop !== 'checked' &&
        prop !== 'valid' &&
        prop !== 'Attribute1' &&
        prop !== 'Attribute2' &&
        prop !== 'Attribute3' &&
        prop !== 'invalidFields' &&
        prop !== 'type' &&
        prop !== 'geometry'
      ) {
        if (customAttributeNames.indexOf(prop) > -1) {
          //it is a custom attribute
          properties[prop] = feature[prop];
        } else if (genericFields.indexOf(prop) > -1) {
          //it is a normal, expected attribute of this template
          properties[prop] = discernPropValue(feature, prop);
        }
      }
    });

    if (!properties['Start Date']) {
      properties['Start Date'] = '';
    }
    if (!properties['End Date']) {
      properties['End Date'] = '';
    }

    properties['Wind Barrier'] = '';
    properties['Riparian Buffers'] = '';
    properties['Buffer Zones'] = '';
    properties['Latitude'] = feature.Latitude;
    properties['Longitude'] = feature.Longitude;

    properties['attributes'] = feature.attributes || {};
    properties['errorDetails'] = feature.errorDetails || '';
    if (!properties['Accuracy Rating of Location Entered']) {
      properties['Accuracy Rating of Location Entered'] = null; //"Don't Know";
    }

    featProps.push(properties);
  });

  return featProps;
}

export function createFeaturePropsForNonCommodity(locationData) {
  const featProps = [];
  locationData.forEach((feature) => {
    const properties = {};

    Object.keys(feature).forEach((prop) => {
      if (
        prop !== 'checked' &&
        prop !== 'valid' &&
        prop !== 'invalidFields' &&
        prop !== 'type' &&
        prop !== 'geometry'
      ) {
        properties[prop] = discernPropValue(feature, prop);
      }
    });

    if (!properties['Start Date']) {
      properties['Start Date'] = '';
    }
    if (!properties['End Date']) {
      properties['End Date'] = '';
    }

    properties['Wind Barrier'] = '';
    properties['Riparian Buffers'] = '';
    properties['Buffer Zones'] = '';
    properties['Latitude'] = feature.Latitude;
    properties['Longitude'] = feature.Longitude;
    properties['Geometry'] = feature.geometry;

    if (!properties['Accuracy Rating of Location Entered']) {
      properties['Accuracy Rating of Location Entered'] = null; //"Don't Know";
    }
    if (!properties['Investment Name']) {
      properties['Investment Name'] = feature['Location Name'];
    }

    properties['attributes'] = feature.attributes || {};
    properties['errorDetails'] = feature.errorDetails || '';

    featProps.push(properties);
  });

  return featProps;
}

export function deleteGeoJSONFeatureProperties(geojson): void {
  geojson.features.forEach((feature) => {
    delete feature.properties.list_id;
    delete feature.properties.location_id;
    delete feature.properties.flag_forma;
    delete feature.properties.flag_general;
    delete feature.properties.flag_glad;
    delete feature.properties.flag_gran_chaco;
    delete feature.properties.flag_terrai;
    delete feature.properties.flag_viirs;
  });
}

interface RecordType {
  COLUMN_NAME: string;
}

export const ComposeCopyQueryStatement = async (
  clientDatabase: string,
  selectedListId: number,
  srcListAnalysisTable: string,
  isGFWList = false
) => {
  const tableColumns = await GetTableAnalysisColumnsById(clientDatabase, selectedListId, isGFWList);

  // get valid columns from AnalysisSchema by extracting the 'name' property values
  const validColumns = Object.values(AnalysisSchema.columns).map(
    (column: { name?: string }) => column.name
  );

  // Extract column names and filter to include only valid ones
  const columnNames = tableColumns?.map((record: RecordType) => record.COLUMN_NAME) ?? [];
  const filteredColumns = columnNames.filter((column) => validColumns.includes(column));

  const statement = filteredColumns
    .map((column) => `[${column}] = [${srcListAnalysisTable}].[${column}]`)
    .join(',');

  return statement;
};

export type ListFilters = {
  country?: string;
  state?: string;
  subState?: string;
  analysisAreaMin?: number;
  analysisAreaMax?: number;
  searchString?: string;
};

export const ListHasFiltersApplies = (filters: ListFilters) => {
  return (
    filters.country ||
    filters.state ||
    filters.subState ||
    filters.analysisAreaMin ||
    filters.analysisAreaMax ||
    filters.searchString
  );
};

export type ListValidationErrors =
  | 'MISSING_LIST_NAME'
  | 'LIST_NAME_ALREADY_EXISTS'
  | 'INVALID_LIST_NAME';

export const CheckListNameIsValid = (
  selectedNewOrExisting: string,
  listName: string,
  userListNames: string[]
) => {
  const lowerListName = listName ? listName.toLowerCase() : listName;
  const checkListExists = userListNames.find((name) => name === lowerListName);
  const checkForPunctuation = lowerListName ? ContainsPunctuation(lowerListName) : false;

  if (!listName) {
    throw new Error('MISSING_LIST_NAME');
  } else if (checkListExists && selectedNewOrExisting === 'new') {
    throw new Error('LIST_NAME_ALREADY_EXISTS');
  } else if (checkForPunctuation && selectedNewOrExisting === 'new') {
    throw new Error('INVALID_LIST_NAME');
  }
};

export const createFeatureProps = (
  locationData,
  addType: string,
  templateData,
  customAttributesNames: string
) => {
  const customAttributes = [];
  if (addType === 'commodity') {
    const [customAttributeNames, genericFields] = getCustomAttributeNamesAndGenericFields(
      customAttributesNames,
      templateData
    );

    customAttributeNames.forEach((customAtt) => {
      customAttributes.push({
        column_name: customAtt,
        column_type: 'Text',
      });
    });

    // templateId = templateData ? templateData[0].template_id : -1;

    return createfeaturePropsForCommodity(locationData, customAttributeNames, genericFields);
  } else {
    // templateId = templateData ? templateData[0].template_id : -1;
    return createFeaturePropsForNonCommodity(locationData);
  }
};

export const UnlockLists = (clientDatabase: string, listsIds: number[]) => {
  const listsToUnlock = [];
  for (const listsId of listsIds) {
    listsToUnlock.push(UnlockList(clientDatabase, listsId));
  }
  return Promise.all(listsToUnlock);
};

export const PerformCopyAnalysis = async (
  clientDatabase: string,
  srcListAnalysisTable: string,
  sourceListId: number,
  destinationListId: number,
  sourceLocationIds: number[],
  destinationLocationIds: number[],
  isGFWList = false
) => {
  const statement = await ComposeCopyQueryStatement(
    clientDatabase,
    sourceListId,
    srcListAnalysisTable,
    isGFWList
  );

  Logger.log(
    `Selected Locations ${JSON.stringify(
      sourceLocationIds
    )} to Destination Locations: ${JSON.stringify(destinationLocationIds)}`,
    'LocationsService'
  );
  Logger.log(
    `Copy params: ${sourceListId}, ${destinationListId}, ${clientDatabase}`,
    'LocationsService'
  );
  Logger.log(`Copy statement: ${statement}`, 'LocationsService');

  // Performing Copy Locations
  if (sourceLocationIds.length !== destinationLocationIds.length) {
    throw new Error('sourceLocationIds and destinationLocationIds must have the same length');
  }

  for (let i = 0; i < sourceLocationIds.length; i++) {
    const srcLocationId = sourceLocationIds[i];
    const destLocationId = destinationLocationIds[i];

    const parameters = [
      {
        field: 'dest_list_id',
        type: sql.Int,
        value: destinationListId,
      },
      {
        field: 'dest_location_id',
        type: sql.Int,
        value: destLocationId,
      },
      {
        field: 'src_list_id',
        type: sql.Int,
        value: sourceListId,
      },
      {
        field: 'src_location_id',
        type: sql.Int,
        value: srcLocationId,
      },
      {
        field: 'statement',
        type: sql.NVarChar(sql.MAX),
        value: statement,
      },
    ];

    // GFW List has a different table name for the analysis table
    if (isGFWList) {
      await SQLUtils.queryDB(clientDatabase, 'copyGFWLocationAnalysis', parameters);
    } else {
      await SQLUtils.queryDB(clientDatabase, 'copyLocationAnalysis', parameters);
    }
  }
};

export async function PerformLocationsBulkCopy(
  listId,
  listName,
  createTable: boolean,
  geoJson,
  commodityType,
  clientDatabase
) {
  const bulkcopy = new ListBulkCopy();
  const resultingBulkGeoJSON = await bulkcopy.uploadBulkLocations(
    listId,
    listName,
    createTable,
    geoJson,
    commodityType,
    clientDatabase
  );

  const destLocationIds = resultingBulkGeoJSON.features.map(
    (feature) => feature.properties.location_id
  );

  destLocationIds.sort((a, b) => a - b);

  return destLocationIds;
}

// Get the analyses (including status for each) for given list
export async function getListAnalysisStatus(
  clientDatabase: string,
  listId: number
): Promise<ListsAnalysisStatus[]> {
  const parameters = [{ field: 'ListID', type: sql.Int, value: listId }];
  return await SQLUtils.queryDB<ListsAnalysisStatus[]>(
    clientDatabase,
    'getListAnalysisStatusById',
    parameters
  );
}

export async function setListAnalysisStatus(
  clientDatabase: string,
  listId: number,
  analysisIds: string[],
  status: number = listStatus.Pending,
  organizationId?: number,
  options?: string
) {
  const clientStoreConnection = new ClientStoreConnection();
  const connection = await clientStoreConnection.getConnection(clientDatabase);
  const listAnalysisStatusRepository = connection.getRepository(ListsAnalysisStatus);

  const isPalmRiskIncluded = analysisIds.includes(analysisTypes.PALM_RISK);

  // GPV-5400: Capture if Weekly was requested before filtering it out
  const isWeeklyRequested =
    analysisIds.includes(AlertsAnalysisFrequency.WEEKLY) ||
    options?.toLowerCase() === AlertsAnalysisFrequency.WEEKLY.toLowerCase();

  // Check feature flag for weekly alerts
  let weeklyAlertsOptIn = false;
  if (organizationId) {
    try {
      const { getFeatureFlagsForCurrentOrg } = await featureFlagsService();
      const flags = await getFeatureFlagsForCurrentOrg(organizationId!);
      weeklyAlertsOptIn = flags.some((flag) => flag.flagId === 'WeeklyAlerts' && flag.flagState);
    } catch (error) {
      // If feature flag lookup fails, fall back to disabled (opt-in not required)
      weeklyAlertsOptIn = false;
    }
  }

  await Promise.all(
    analysisIds
      .filter(
        (analysisId) =>
          analysisId !== analysisTypes.PALM_RISK && analysisId !== AlertsAnalysisFrequency.WEEKLY
      )
      .map(async (analysisId) => {
        // Ensuring analysisId is a valid analysis type
        const normalizedAnalysisId = Object.values(analysisTypes).find(
          (type) => type.toLowerCase() === analysisId.toLowerCase()
        );

        if (!normalizedAnalysisId) {
          throw new Error(`Invalid analysisId: ${analysisId}`);
        }

        const value = {
          status,
          errorInfo: null,
          updateTime: new Date().toISOString(),
          s3URL: null,
          expirationTime: null,
          bundleCreationTime: null,
          options: null,
        };

        // Handle FCD with PalmRisk option
        if (
          isPalmRiskIncluded &&
          normalizedAnalysisId === analysisTypes.FOREST_CHANGE_DIAGNOSTICS
        ) {
          value.options = analysisTypes.PALM_RISK;
        }

        // GPV-5141 default options=Weekly for ALERTS analysis
        // GPV-5181: Handle Weekly Alerts options based on feature flag
        // GPV-5400: Check isWeeklyRequested to handle both upload (analysisIds) and enrollment (options)
        if (normalizedAnalysisId === analysisTypes.ALERTS) {
          if (weeklyAlertsOptIn) {
            // Feature flag is ON: only set Weekly if explicitly requested
            if (isWeeklyRequested) {
              value.options = AlertsAnalysisFrequency.WEEKLY;
            }
            // Otherwise, leave options as null (not setting Weekly)
          } else {
            // Feature flag is OFF: always set Weekly (backward compatibility)
            value.options = AlertsAnalysisFrequency.WEEKLY;
          }
        }

        const existingRecord = await listAnalysisStatusRepository.findOne({
          where: { listId, analysisId: normalizedAnalysisId },
        });

        // Save or update for ALL analysis types
        if (existingRecord) {
          await listAnalysisStatusRepository.update(
            { listId, analysisId: normalizedAnalysisId },
            value
          );
        } else {
          await listAnalysisStatusRepository.save({
            listId,
            analysisId: normalizedAnalysisId,
            ...value,
          });
        }
      })
  );
}

export async function setListAnalysisStatusByTypes(
  clientDatabase: string,
  listId: number,
  analysisTypesToProcess: string,
  status: number = listStatus.Pending,
  organizationId?: number,
  options?: string
) {
  const analysisTypesToUpdate = analysisTypesToProcess
    .split(',')
    .map((type) => type.trim())
    .filter(Boolean);
  return await setListAnalysisStatus(
    clientDatabase,
    listId,
    analysisTypesToUpdate,
    status,
    organizationId,
    options
  );
}
