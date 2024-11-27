import { AbstractHandler, ChainType, ListAttributesRecords, RequestNewList } from './types';
import { SQLUtils } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import * as sql from 'mssql';

interface AttributeInfo {
  attribute_name: string;
  attribute_type: number;
}

enum ListsAttrsTypes {
  Int = 1,
  Text = 2
};

export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);
  private sqlUtilsConn: SQLUtils;

  constructor(sqlUtilsConn: SQLUtils) {
    super();
    this.sqlUtilsConn = sqlUtilsConn;
  }

  private async getAttributesFromListTable(listTable: string): Promise<AttributeInfo[]> {
    const query = `SELECT [attributes] as attributesJson FROM [${listTable}] WHERE [attributes] IS NOT NULL`;

    // execute the query
    type ListAttributeRaw = {
      attributesJson: string;
    };
    const resultsets = await this.sqlUtilsConn.executeQuery<ListAttributeRaw[]>(query);
    const attributesMap = new Map<string, number>(); // map for attribute_name and attribute_type

    if (resultsets) {
      // iterate each row to parse and collect attributes
      for (const row of resultsets) {
        let attributes: ListAttributesRecords;
        const { attributesJson } = row;
        console.log("🚀 ~ SaveListAttributes ~ getAttributesFromListTable ~ attributesJson:", attributesJson)
        try {
          attributes = JSON.parse(attributesJson);
          console.log("🚀 ~ SaveListAttributes ~ getAttributesFromListTable ~ attributes:", attributes)
        } catch (error) {
          this.logger.error(`Error parsing attributes JSON: ${attributesJson}`, error);
          continue; // just skip if parsing fails
        }
  
        for (const [attributeKey, attributeObj] of Object.entries(attributes)) {
          let attributeType: string | number;
          if (attributeObj.type === 'number') {
            attributeType = ListsAttrsTypes.Int;
          } else {
            attributeType = ListsAttrsTypes.Text;
          }
  
          // IF attributeKey already exists, ensure that the attributeType is consistent
          // scenario: user uploaded list with some empty values and we defaulted to string but there are number values
          if (attributesMap.has(attributeKey)) {
            const existingType = attributesMap.get(attributeKey);
            if (existingType !== attributeType) {
              // warn for inconsistent list types
              this.logger.warn(
                `Attribute '${attributeKey}' has inconsistent types: ${existingType} and ${attributeType}. Defaulting to type '2' (text).`
              );
              /** 
               * TODO: 
               * search records (maybe N depth?) to find suitable type. Something like: 
               * type ExistingAttributesTypes = {
               *  records: string
               * };
               * const searchQuery = `SELECT JSON_QUERY([attributes], '$.${attributeKey}.type') as records FROM [${listTable}] WHERE [attributes] IS NOT NULL AND list_id = @listId`
               * const params = [{ field: 'list_id', type: sql.Int, value: listId }]
               * const existingRecordsResults = await this.sqlUtilsConn.executeQuery<ExistingAttributesTypes[]>(searchQuery, params);
               * TODO: figure why the above does not work for '$.${attributeKey}.type is not working
               * TODO: afterwards order/sort the collection by type and grab one of the largest group
               */
              // lets default to text if types are inconsistent for now
              attributesMap.set(attributeKey, ListsAttrsTypes.Text);
            }
          } else {
            attributesMap.set(attributeKey, attributeType);
          }
        }
      }
    }

    // convert to an array of AttributeInfo
    const attributeInfos: AttributeInfo[] = [];
    for (const [attribute_name, attribute_type] of attributesMap.entries()) {
      attributeInfos.push({ attribute_name, attribute_type });
    }

    return attributeInfos;
  }

  private async saveAttributesToListAttributes(
    listId: number,
    attributes: AttributeInfo[]
  ): Promise<void> {
    // fetch existing attribute names for the list to avoid duplicates
    const existingAttributesQuery = `SELECT attribute_name FROM [ListAttributes] WHERE list_id = @list_id`;
    const existingAttributesResult = await this.sqlUtilsConn.executeQuery<{attribute_name: string}[]>(existingAttributesQuery, [
      { field: 'list_id', type: sql.Int, value: listId },
    ]);

    const existingAttributeNames = new Set<string>();

    if (existingAttributesResult) {
      for (const row of existingAttributesResult) {
        existingAttributeNames.add(row.attribute_name);
      }
    }
    
    for (const attribute of attributes) {
      if (existingAttributeNames.has(attribute.attribute_name)) {
        continue; // skip attributes that already exist
      }

      // insert new attributes into the ListAttributes table
      const query = `INSERT INTO [ListAttributes] (list_id, attribute_name, attribute_type) VALUES (@list_id, @attribute_name, @attribute_type)`;
      const parameters = [
        { field: 'list_id', type: sql.Int, value: listId },
        { field: 'attribute_name', type: sql.NVarChar(64), value: attribute.attribute_name },
        { field: 'attribute_type', type: sql.SmallInt, value: attribute.attribute_type },
      ];

      try {
        await this.sqlUtilsConn.executeQuery(query, parameters);
        this.logger.log(`Saving lists attributes fields`);
      } catch (error) {
        // log for now, and continue with the next attribute
        this.logger.error(
          `Error inserting attribute '${attribute.attribute_name}' into ListAttributes`,
          error
        );
      }
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { listId, listTable } = request.request as RequestNewList;

    // get attributes
    const attributeInfos = await this.getAttributesFromListTable(listTable);
    console.log("🚀 ~ SaveListAttributes ~ handle ~ attributeInfos:", attributeInfos)

    // save them into the [ListAttributes] table
    await this.saveAttributesToListAttributes(listId, attributeInfos);
    
    // do not stop the chain
    return request;
  }
}
