import { AbstractHandler, ChainType, RequestNewList } from './types';
import {
  ClientStoreConnection,
  ListAttributes,
  getMissingJsonPropertiesFromList,
  MissingPropertiesReturnType,
} from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { QueryRunner } from 'typeorm';
import { ID_TYPE_HANDLER } from '@wri-monorepos/shared';

const getIdColumnsWithValues = () => {
  const columns = new Set(
    Object.keys(ID_TYPE_HANDLER).flatMap((type) => {
      const { validateColumns } = ID_TYPE_HANDLER[type];

      return validateColumns;
    })
  );
  return Array.from(columns);
};
interface UpdateListAttributesRemoveIdColumnsParams {
  sourceListId: number;
  isNotDeletingTheSourceList: boolean;
}
export class UpdateListAttributesRemoveIdColumns extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(UpdateListAttributesRemoveIdColumns.name);

  private isNotDeletingTheSourceList: boolean;
  private onlyCheckFor: string[];
  private sourceListId: number;

  constructor(params: UpdateListAttributesRemoveIdColumnsParams) {
    super();
    const { isNotDeletingTheSourceList, sourceListId } = params;
    this.sourceListId = sourceListId;
    this.isNotDeletingTheSourceList = isNotDeletingTheSourceList;
    this.onlyCheckFor = getIdColumnsWithValues();
  }

  /**
   * @summary
   * Checks if there are rows with property keys in [attributes]
   * in given array of propertyNames,
   *
   * @param queryRunner
   * @param listAttributesAsJson json_string
   * @returns string[]
   */
  async getEmptyJsonProperties(queryRunner: QueryRunner, listAttributesAsJson: string) {
    const result: MissingPropertiesReturnType = await queryRunner.query(
      getMissingJsonPropertiesFromList, [this.sourceListId, listAttributesAsJson]
    );

    const { MissingProperties = [] } = result;

    return MissingProperties;
  }

  /**
   * @param input ChainType
   * @returns input ChainType
   */
  async handle(input: ChainType): Promise<ChainType> {
    const { listAttributesRecords, organization_database } = input.request as RequestNewList;
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organization_database);
    const queryRunner = connection.createQueryRunner();

    try {
      if (
        this.isNotDeletingTheSourceList && 
        (listAttributesRecords && listAttributesRecords.size > 0) &&
        this.onlyCheckFor.some((col) => listAttributesRecords.has(col)) // limit to Id Types
      ) {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        const listAttributesValues = [...listAttributesRecords.values()].map(({ attribute_name }) => attribute_name);
        const emptyJsonProperties = await this.getEmptyJsonProperties(
          queryRunner,
          JSON.stringify(listAttributesValues)
        );

        /**
         * If the source list doesn't have more data with the attributes of the locations
         * we just deleted, that (should) means that these locations were the only containing
         * this data.
         */
        if (emptyJsonProperties.length > 0) {
          const listAttributesRepository = queryRunner.manager.getRepository(ListAttributes);
          emptyJsonProperties.forEach(async (attributeName) => {
            await listAttributesRepository.delete({
              attribute_name: attributeName,
              list_id: this.sourceListId,
            });
          });
        }

        await queryRunner.commitTransaction();
      }
    } catch (error) {
      this.logger.log('Error hanlding UpdateListAttributesRemoveIdColumns', error.stack || error);
      await queryRunner.rollbackTransaction();
      throw new error();
    } finally {
      await queryRunner.release();
    }

    return input;
  }
}
