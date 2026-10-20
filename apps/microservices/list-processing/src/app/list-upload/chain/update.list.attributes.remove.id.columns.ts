/**

 * Copyright (c) 2026 World Resources Institute

 *

 * This source code is licensed under the MIT license found in the

 * LICENSE file in the root directory of this source tree.

 */

import { AbstractHandler, ChainType, RequestNewList } from './types';
import { ClientStoreConnection, getMissingJsonPropertiesFromList } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
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
  clientStoreConnection?: ClientStoreConnection;
}
export class UpdateListAttributesRemoveIdColumns extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(UpdateListAttributesRemoveIdColumns.name);

  private isNotDeletingTheSourceList: boolean;
  private onlyCheckFor: string[];
  private sourceListId: number;
  private clientStoreConnection: ClientStoreConnection;

  constructor(params: UpdateListAttributesRemoveIdColumnsParams) {
    super();
    const { isNotDeletingTheSourceList, sourceListId, clientStoreConnection } = params;
    this.sourceListId = sourceListId;
    this.isNotDeletingTheSourceList = isNotDeletingTheSourceList;
    this.onlyCheckFor = getIdColumnsWithValues();
    this.clientStoreConnection = clientStoreConnection || new ClientStoreConnection();
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
  async getEmptyJsonProperties(transactionalEntityManager: EntityManager) {
    const result = await transactionalEntityManager.query(getMissingJsonPropertiesFromList, [
      this.sourceListId,
    ]);

    if (!result) {
      return [];
    }

    return result.map(({ MissingProperties }) => MissingProperties);
  }

  /**
   * @param input ChainType
   * @returns input ChainType
   */
  async handle(input: ChainType): Promise<ChainType> {
    if (!this.isNotDeletingTheSourceList) {
      return input;
    }

    const { organization_database } = input.request as RequestNewList;
    const connection = await this.clientStoreConnection.getConnection(organization_database);

    try {
      if (this.isNotDeletingTheSourceList) {
        this.logger.log(
          `Checking if list still contains location data with moving attributes after move`
        );

        const emptyJsonProperties = await connection.manager.transaction(
          async (transactionalEntityManager) => {
            return await this.getEmptyJsonProperties(transactionalEntityManager);
          }
        );

        /**
         * If the source list have locations without these attributes,
         * deleted them.
         */
        if (emptyJsonProperties.length > 0) {
          this.logger.log(`Attributes without data in source table: ${emptyJsonProperties}`);
          const attsIn = emptyJsonProperties.map((col) => `'${col}'`).join(',');
          const deleteQuery = `DELETE FROM [ListAttributes] WHERE [attribute_name] IN (${attsIn}) AND [list_id] = @0`;
          await connection.manager.transaction(async (transactionalEntityManager) => {
            await transactionalEntityManager.query(deleteQuery, [this.sourceListId]);
          });
        }
      }
    } catch (error) {
      this.logger.log('Error hanlding UpdateListAttributesRemoveIdColumns', error.stack || error);
      throw error;
    }
    return input;
  }
}
