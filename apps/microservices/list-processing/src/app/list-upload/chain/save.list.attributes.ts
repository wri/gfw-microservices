import { AbstractHandler, ChainType, ListAttributesRecords, ListAttributesRow, RequestNewList } from './types';
import { ClientStoreConnection, ListAttributes, SQLUtils } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import * as sql from 'mssql';

interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}

enum ListsAttrsTypes {
  Int = 1,
  Text = 2,
}

const SELECT_NTH_ATTS = 10;

export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);

  private async getAttributesFromListTable(
    organizationDatabase: string,
    listTable: string,
    listId: number
  ): Promise<ListAttributesRecord[]> {
    const selectAttsColumnQuery = `SELECT [attributes] as attributesJson FROM [${listTable}] WHERE [attributes] IS NOT NULL`;

    type ListAttributeRaw = {
      attributesJson: string;
    };
    const resultsets = await SQLUtils.queryDB<ListAttributeRaw[]>(organizationDatabase, selectAttsColumnQuery);
    console.log('🚀 ~ SaveListAttributes ~ getAttributesFromListTable ~ resultsets:', resultsets);
    const existingListAttributesMap = await this.getExisingListAttributesForListId(organizationDatabase, listId);

    if (resultsets && resultsets.length > 0) {
      for (const row of resultsets) {
        let attributes: ListAttributesRow[];
        const { attributesJson } = row;

        try {
          attributes = JSON.parse(attributesJson);
        } catch (error) {
          this.logger.error(
            `Error parsing attributes JSON: ${attributesJson} from ${listTable}, skipping row.`,
            error
          );
          continue;
        }

        for (const attrObj of attributes) {
          let attributeType: string | number;
          if (attrObj.type === 'number') {
            attributeType = ListsAttrsTypes.Int;
          } else {
            attributeType = ListsAttrsTypes.Text;
          }

          // IF attributeKey already exists, ensure that the attributeType is consistent
          // scenario: user uploaded list with empty values at the begining and we defaulted to string but there are rows with number values
          if (existingListAttributesMap.has(attrObj.field)) {
            const existingAttributeObject = existingListAttributesMap.get(attrObj.field);
            if (existingAttributeObject.attribute_type !== attributeType) {
              // warn for inconsistent list types
              this.logger.warn(
                `Attribute '${attrObj.field}' has inconsistent types: ${existingAttributeObject} and ${attributeType}. Defaulting to type '2' (text).`
              );
              /**
               * TODO:
               * search records (maybe N depth?) to find suitable type. Something like:
               * type ExistingAttributesTypes = {
               *  records: string
               * };
               * const searchQuery = `SELECT JSON_QUERY([attributes], '$[0].${attributeKey}.type') as records FROM [${listTable}] WHERE [attributes] IS NOT NULL AND list_id = @listId`
               * const params = [{ field: 'list_id', type: sql.Int, value: listId }]
               * const existingRecordsResults = await this.sqlUtilsConn.executeQuery<ExistingAttributesTypes[]>(searchQuery, params);
               * TODO: figure why the above does not work for '$.${attributeKey}.type is not working
               * TODO: afterwards order/sort the collection by type and grab one of the largest group
               */
              // lets default to text if types are inconsistent for now
              existingListAttributesMap.set(attrObj.field, {
                list_id: listId,
                attribute_name: attrObj.field,
                attribute_type: ListsAttrsTypes.Text,
              });
            }
          } else {
            existingListAttributesMap.set(attrObj.field, {
              list_id: listId,
              attribute_name: attrObj.field,
              attribute_type: attributeType,
            });
          }
        }
      }
    }

    // convert to an array of AttributeInfo
    const attributeInfos: ListAttributesRecord[] = [];
    for (const attributeData of existingListAttributesMap.entries()) {
      attributeInfos.push(attributeData[1]);
    }

    return attributeInfos;
  }

  private async getExisingListAttributesForListId(orgDb: string, listId: number) {
     // fetch existing attribute names first for the list to avoid duplicates
     const query = `SELECT [attribute_name], [attribute_type], [list_id] FROM [ListAttributes] WHERE list_id = @list_id`;
     const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
     const results = await SQLUtils.queryDB<ListAttributesRecord[]>(
       orgDb,
       query,
       parameters
     );
 
     const attrsControlMap = new Map<string, ListAttributesRecord>();
 
     if (results) {
       for (const row of results) {
         attrsControlMap.set(row.attribute_name, row);
       }
     }

     return attrsControlMap;
  }

  // TODO: test typeorm insert logic 
  // TODO: remove plain sql logic
  private async saveLocAttributesToListAttributes(
    orgDb: string,
    attributes: ListAttributesRecord[]
  ): Promise<void> {
    console.log("🚀 ~ SaveListAttributes ~ attributes:", attributes)
    try {
      // insert new attributes with Typeorm listAttributes entity
      const clientStore = new ClientStoreConnection();
      const connection = await clientStore.getConnection(orgDb, [
        ListAttributes,
      ]);
      
      this.logger.log(`Inserting ${attributes.length} into ListAttributes From ListSchema`);

      await connection.manager.save(ListAttributes, attributes);

      // await connection
      //   .createQueryBuilder()
      //   .insert()
      //   .into(ListAttributes)
      //   .values(attributes)
      //   .execute()
    } catch (error) {
      this.logger.error(`Something went wrong inserting ListAttributes`, error.stack || error);
    }

    // for (const attribute of attributes) {
    //   if (existingListAttributes.has(attribute.attribute_name)) {
    //     continue; // skip attributes that already exist
    //   }

    //   // insert new attributes into the ListAttributes table
    //   const query = `INSERT INTO [ListAttributes] (list_id, attribute_name, attribute_type) VALUES (@list_id, @attribute_name, @attribute_type)`;
    //   const parameters = [
    //     { field: 'list_id', type: sql.Int, value: listId },
    //     { field: 'attribute_name', type: sql.NVarChar(64), value: attribute.attribute_name },
    //     { field: 'attribute_type', type: sql.SmallInt, value: attribute.attribute_type },
    //   ];

    //   try {
    //     await SQLUtils.queryDB(orgDb, query, parameters);
    //     this.logger.log(`Saving lists attributes fields`);
    //   } catch (error) {
    //     // log for now, and continue with the next attribute
    //     this.logger.error(
    //       `Error inserting attribute '${attribute.attribute_name}' into ListAttributes`,
    //       error
    //     );
    //   }
    // }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { listId, listTable, organization_database: orgDb } = request.request as RequestNewList;

    const listAttributesRows = await this.getAttributesFromListTable(orgDb, listTable, listId);
    console.log('🚀 ~ SaveListAttributes ~ handle ~ attributeInfos:', listAttributesRows);

    await this.saveLocAttributesToListAttributes(orgDb, listAttributesRows);

    return request;
  }
}
