import { Logger } from '@nestjs/common';
import { selectedList } from './../mock/listGeoMockData';
import {
  GetTableAnalysisColumnsById,
  PerformListBulkCopy,
  RawSQLRunner,
  UnlockList,
} from '@wri-monorepos/sql';

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
  return isSaveAsDraft
    ? LIST_STATUS.LIST_STATUS_DRAFT
    : LIST_STATUS.LIST_STATUS_PENDING;
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

export function getCustomAttributeNamesAndGenericFields(
  customAttributes: string,
  templateData
) {
  const customAttributeNames =
    customAttributes.length > 0 ? customAttributes.split(',') : [];
  const genericFields = [];

  templateData.forEach((template) => {
    // Only specify custom attributes if the field name has been changed.
    if (
      template.template_datum_field_name_updated &&
      template.template_datum_field_name_updated !==
        template.template_datum_field_name
    ) {
      customAttributeNames.push(template.template_datum_field_name_updated);
    } else {
      genericFields.push(template.template_datum_field_name);
    }
  });

  return [customAttributeNames, genericFields];
}

export function createfeaturePropsForCommodity(
  locationData,
  customAttributeNames,
  genericFields
) {
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

    if (!properties['Accuracy Rating of Location Entered']) {
      properties['Accuracy Rating of Location Entered'] = null; //"Don't Know";
    }
    if (!properties['Investment Name']) {
      properties['Investment Name'] = feature['Location Name'];
    }

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
/**
 * Return a Raw SQL query to copy analysis from one list to another
 * @param sourceListId - List id from which analysis will be copied
 * @param destinationListId - List id to which analysis will be copied
 * @param sourceLocationIds - Location ids from which analysis will be copied, string IDs separated by comma, ex: 1,2,3
 * @param destinationLocationIds - Location ids to which analysis will be copied, string IDs separated by comma, ex: 1,2,3
 * @param statement - Partial SQL statement to be executed composed by ComposeCopyQueryStatement function, ex: [columnA] = [srcListAnalysisTable].[columnA], [columnB] = [srcListAnalysisTable].[columnB]
 * @returns
 */
export const ComposeAnalysisCopyQuery = (
  sourceListId: number,
  destinationListId: number,
  sourceLocationIds: number[],
  destinationLocationIds: number[],
  statement: string
) => {
  return `declare @SourceTableIds table ( Id int IDENTITY(1,1) PRIMARY KEY,sourceId int);
          declare @DestinationTableIds table ( Id int IDENTITY(1,1) PRIMARY KEY,destinationId int);

          declare @sourceIDs varchar(1000);
          declare @destinationIDs varchar(1000);
          declare @sourceID INT;
          declare @destinationID INT;
          declare @sourceListID INT;
          declare @destinationListID INT;
          declare @statement NVARCHAR(MAX)

          SET @sourceListID = ${sourceListId};
          SET @destinationListID = ${destinationListId};
          SET @statement = '${statement}';

          SET @sourceIDs = '${sourceLocationIds.join(',')}';
          SET @destinationIDs = '${destinationLocationIds.join(',')}';

          insert into @SourceTableIds(sourceId) SELECT value from STRING_SPLIT(@sourceIDs, ',')

          insert into @DestinationTableIds(destinationId) SELECT value from STRING_SPLIT(@destinationIDs, ',')

          DECLARE copy_analysis_cursor CURSOR FOR
          SELECT sourceId, destinationId FROM @SourceTableIds A INNER JOIN @DestinationTableIds B ON A.Id = B.Id

          OPEN copy_analysis_cursor
          FETCH NEXT FROM copy_analysis_cursor INTO @sourceID, @destinationID

          WHILE @@FETCH_STATUS = 0
          BEGIN
                EXEC uspCopyLocationAnalysis @destinationListID, @destinationID, @sourceListID, @sourceID, @statement
                FETCH NEXT FROM copy_analysis_cursor INTO @sourceID, @destinationID
          END

          CLOSE copy_analysis_cursor
          DEALLOCATE copy_analysis_cursor
  `;
};

export const ComposeCopyQueryStatement = async (
  clientDatabase: string,
  selectedListId: number,
  srcListAnalysisTable: string
) => {
  const tableColumns = await GetTableAnalysisColumnsById(
    clientDatabase,
    selectedListId
  );
  const columns = tableColumns.map((record: any) => record.COLUMN_NAME);
  const statement = columns
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
  const checkForPunctuation = lowerListName
    ? ContainsPunctuation(lowerListName)
    : false;

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
    const [customAttributeNames, genericFields] =
      getCustomAttributeNamesAndGenericFields(
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

    return createfeaturePropsForCommodity(
      locationData,
      customAttributeNames,
      genericFields
    );
  } else {
    // templateId = templateData ? templateData[0].template_id : -1;
    return createFeaturePropsForNonCommodity(locationData);
  }
};

export const GetTemplateId = (templateData) => {
  return templateData ? templateData[0].template_id : -1;
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
  destinationLocationIds: number[]
) => {
  const statement = await ComposeCopyQueryStatement(
    clientDatabase,
    sourceListId,
    srcListAnalysisTable
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

  const SQLRunner = new RawSQLRunner();
  const copyAnalysisRawQuery = ComposeAnalysisCopyQuery(
    sourceListId,
    destinationListId,
    sourceLocationIds,
    destinationLocationIds,
    statement
  );

  await SQLRunner.run(clientDatabase, copyAnalysisRawQuery);
};

export async function PerformLocationsBulkCopy(
  listId,
  listName,
  createTable: boolean,
  geoJson,
  commodityType,
  clientDatabase
) {
  const resultingBulkGeoJSON = await PerformListBulkCopy(
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
