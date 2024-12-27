import { AbstractHandler, AttributeType, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, ListAttributes, SQLUtils } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { Feature } from '@wri-monorepos/geo';

interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}

export enum ListsAttrsTypes {
  Int = 1,
  Text = 2,
}

export class SaveListAttributes extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(SaveListAttributes.name);

  async saveLocAttributesToListAttributes(
    orgDb: string,
    attributes: ListAttributesRecord[]
  ): Promise<void> {
    try {
      // insert new attributes with Typeorm listAttributes entity
      const clientStore = new ClientStoreConnection();
      const connection = await clientStore.getConnection(orgDb, [ListAttributes]);

      this.logger.log(`Inserting ${attributes.length} into [ListAttributes]`);

      await connection
        .createQueryBuilder()
        .insert()
        .into(ListAttributes)
        .values(attributes)
        .orIgnore()
        .execute();
    } catch (error) {
      // will throw erros for rows failing but not for the entire batch
      this.logger.warn(`Something went wrong executing query.`, error.stack || error);
    }
  }

  async getExistingListAttributesByListId(orgDb: string, list_id: number) {
    const query = `SELECT [attribute_name] FROM [ListAttributes] WHERE list_id = ${list_id}`;
    const results = await SQLUtils.queryDB<{ attribute_name: string }[]>(orgDb, query);

    const existingAttributes = new Set<string>();

    results.forEach(({ attribute_name }) => {
      existingAttributes.add(attribute_name);
    });

    return existingAttributes;
  }

  async extractFeatureAttributes(
    orgDb: string,
    list_id: number,
    feature: Feature
  ): Promise<ListAttributesRecord[]> {
    const { attributes: unparsedAttributes } = feature.properties;
    const existingAttributes = await this.getExistingListAttributesByListId(orgDb, list_id);
    let attributes: AttributeType[];

    try {
      attributes = JSON.parse(unparsedAttributes as string);
      attributes = attributes.filter((attr) => !existingAttributes.has(attr.field));

      return attributes.map((attr) => {
        return {
          list_id,
          attribute_name: attr.field,
          attribute_type: attr.type === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text,
        } as ListAttributesRecord;
      });
    } catch (error) {
      this.logger.error(`Error parsing attributes`, error.stack || error);
      throw new Error(error);
    }
  }

  async handle(input: ChainType): Promise<ChainType> {
    const oneFeature = input.geojson.features[0];

    if (!oneFeature) {
      return input;
    }

    const { list_id, organization_database: orgDb } = input.request as RequestNewList;

    try {
      const listAttributes = await this.extractFeatureAttributes(orgDb, list_id, oneFeature);
      this.saveLocAttributesToListAttributes(orgDb, listAttributes);
    } catch (error) {
      this.logger.error(`Something went wrong.`, error.stack || error);
    }

    return input;
  }
}
