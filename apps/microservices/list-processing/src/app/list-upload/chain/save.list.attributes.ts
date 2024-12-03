import { AbstractHandler, ChainType, ListAttributesRow, RequestNewList } from './types';
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

const SEARCH_NTH_DEPTH = 100;

export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);

  protected async getAttributesFromListTable(
    organizationDatabase: string,
    listTable: string,
    listId: number
  ): Promise<ListAttributesRecord[]> {
    const selectAttsColumnQuery = `SELECT [attributes] as attributesJson FROM [${listTable}] WHERE [attributes] IS NOT NULL`;

    type ListAttributeRaw = {
      attributesJson: string;
    };
    const resultsets = await SQLUtils.queryDB<ListAttributeRaw[]>(
      organizationDatabase,
      selectAttsColumnQuery
    );
    const existingListAttributesMap = await this.getExistingListAttributesForListId(
      organizationDatabase,
      listId
    );

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

              // attempt to determine the correct type from records
              const determinedType = await this.determineAttributeType(
                organizationDatabase,
                listTable,
                listId,
                attrObj.field
              );

              existingListAttributesMap.set(attrObj.field, {
                list_id: listId,
                attribute_name: attrObj.field,
                attribute_type: determinedType,
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

  protected async getExistingListAttributesForListId(
    orgDb: string,
    listId: number
  ): Promise<Map<string, ListAttributesRecord>> {
    // fetch existing attribute names first for the list to avoid duplicates
    const query = `SELECT [attribute_name], [attribute_type], [list_id] FROM [ListAttributes] WHERE list_id = @list_id`;
    const parameters = [{ field: 'list_id', type: sql.Int, value: listId }];
    const results = await SQLUtils.queryDB<ListAttributesRecord[]>(orgDb, query, parameters);

    const attrsControlMap = new Map<string, ListAttributesRecord>();

    if (results) {
      for (const row of results) {
        attrsControlMap.set(row.attribute_name, row);
      }
    }

    return attrsControlMap;
  }

  protected async determineAttributeType(
    orgDb: string,
    listTable: string,
    listId: number,
    attributeName: string,
    maxRecords: number = SEARCH_NTH_DEPTH
  ): Promise<number> {
    const selectAttributesQuery = `SELECT TOP (${maxRecords}) [attributes] as attributesJson FROM [${listTable}] WHERE [attributes] IS NOT NULL AND list_id = @listId`;
    const parameters = [{ field: 'listId', type: sql.Int, value: listId }];
    const resultsets = await SQLUtils.queryDB<{ attributesJson: string }[]>(
      orgDb,
      selectAttributesQuery,
      parameters
    );

    const typeCounts = new Map<number, number>();

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

        const attrObj = attributes.find((attr) => attr.field === attributeName);
        if (attrObj) {
          const attributeType =
            attrObj.type === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text;
          typeCounts.set(attributeType, (typeCounts.get(attributeType) || 0) + 1);
        }
      }
    }

    // Determine the type with the highest count
    let maxCount = 0;
    let selectedType = ListsAttrsTypes.Text; // Default to text
    for (const [type, count] of typeCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        selectedType = type;
      }
    }

    return selectedType;
  }

  protected async saveLocAttributesToListAttributes(
    orgDb: string,
    attributes: ListAttributesRecord[]
  ): Promise<void> {
    try {
      // insert new attributes with Typeorm listAttributes entity
      const clientStore = new ClientStoreConnection();
      const connection = await clientStore.getConnection(orgDb, [ListAttributes]);

      this.logger.log(`Inserting ${attributes.length} into ListAttributes From ListSchema`);

      await connection
        .createQueryBuilder()
        .insert()
        .into(ListAttributes)
        .values(attributes)
        .execute();
    } catch (error) {
      this.logger.error(`Something went wrong inserting ListAttributes`, error.stack || error);
    }
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { listId, listTable, organization_database: orgDb } = request.request as RequestNewList;
    const listAttributesRows = await this.getAttributesFromListTable(orgDb, listTable, listId);

    await this.saveLocAttributesToListAttributes(orgDb, listAttributesRows);

    return request;
  }
}
