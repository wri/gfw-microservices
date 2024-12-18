import { AbstractHandler, AttributeType, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, ListAttributes } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { Feature } from '@wri-monorepos/geo';

interface ListAttributesRecord {
  list_id: number;
  attribute_name: string;
  attribute_type: number;
}

enum ListsAttrsTypes {
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

  extractFeatureAttributes(list_id: number, feature: Feature): ListAttributesRecord[] {
    const { attributes: unparsedAttributes } = feature.properties;
    let attributes: AttributeType[];

    try {
      attributes = JSON.parse(unparsedAttributes as string);
    } catch (error) {
      this.logger.error(`Error parsing attributes`, error.stack || error);
      throw new Error(error);
    }

    return attributes.map(
      (attr) =>
        ({
          list_id,
          attribute_name: attr.field,
          attribute_type: attr.type === 'number' ? ListsAttrsTypes.Int : ListsAttrsTypes.Text,
        } as ListAttributesRecord)
    );
  }

  async handle(request: ChainType): Promise<ChainType> {
    const { geojson } = request;
    const { listId, organization_database: orgDb } = request.request as RequestNewList;

    const oneFeature = geojson.features?.[0];
    const listAttributes = this.extractFeatureAttributes(listId, oneFeature);

    await this.saveLocAttributesToListAttributes(orgDb, listAttributes);

    return request;
  }
}
