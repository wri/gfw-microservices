import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, getMissingJsonPropertiesFromList } from '@wri-monorepos/sql';
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
  async getEmptyJsonProperties(queryRunner: QueryRunner) {
    const result = await queryRunner.query(getMissingJsonPropertiesFromList, [this.sourceListId]);

    return result.map(({ MissingProperties }) => MissingProperties);
  }

  /**
   * @param input ChainType
   * @returns input ChainType
   */
  async handle(input: ChainType): Promise<ChainType> {
    const { organization_database } = input.request as RequestNewList;
    const clientStoreConnection = new ClientStoreConnection();
    const connection = await clientStoreConnection.getConnection(organization_database);
    const queryRunner = connection.createQueryRunner();

    try {
      if (this.isNotDeletingTheSourceList) {
        await queryRunner.connect();
        await queryRunner.startTransaction();

        this.logger.log(
          `Checking if list still contains location data with moving attributes after move`
        );

        const emptyJsonProperties = await this.getEmptyJsonProperties(queryRunner);

        /**
         * If the source list have locations without these attributes,
         * deleted them.
         */
        if (emptyJsonProperties.length > 0) {
          this.logger.log(`Attributes without data in source table: ${emptyJsonProperties}`);
          const attsIn = emptyJsonProperties.map((col) => `'${col}'`).join(',');
          const deleteQuery = `DELETE FROM [ListAttributes] WHERE [attribute_name] IN (${attsIn}) AND [list_id] = @0`;
          await queryRunner.query(deleteQuery, [this.sourceListId]);
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
