/**
 * Repository responsible for all direct interactions with the database
 * related to converters.
 */

import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ConverterStatus } from '@wri-monorepos/constants';

@Injectable()
export class ConverterRepository {
  /**
   * Retrieves the client stores associated with a given organization ID.
   * @param organizationId The ID of the organization to filter by (optional).
   * @returns A list of client store database names.
   */
  async getClientStoresByOrgId(connection: DataSource, organizationId?: number): Promise<string[]> {
    let query = 'SELECT organization_db FROM Organizations';
    const params: any[] = [];

    if (organizationId) {
      query += ' WHERE id = ?';
      params.push(organizationId);
    }

    const results: { organization_db: string }[] = await connection.query(query, params);

    return results.map((row) => row.organization_db);
  }

  /**
   * Records an error in the ConverterStatus table.
   * @param connection The database connection to use.
   * @param parentJobId The ID of the parent converter status.
   * @param errorMessage The error message to record.
   * @param organizationId The ID of the organization where the error occurred.
   * @param listId The ID of the list associated with the error.
   */
  async recordError(
    connection: DataSource,
    parentJobId: number,
    errorMessage: string,
    organizationId: string,
    listId: number
  ): Promise<void> {
    await connection
      .createQueryBuilder()
      .insert()
      .into('ConverterStatus')
      .values({
        id: parentJobId,
        organization_id: organizationId,
        list_id: listId,
        status: 'FAILED',
        error_details: errorMessage,
        start_time: new Date(),
      })
      .execute();
  }

  /**
   * Retrieves the name of the converter based on its ID.
   * @param gfwProConnection The connection to the GFW Pro database.
   * @param id The ID of the converter.
   * @returns The name of the converter.
   */
  async getConverterName(connection: DataSource, id: number): Promise<string> {
    const result = await connection.query(`
      SELECT [name]
      FROM [ConverterStatus]
      WHERE [id] = ${id}
    `);

    if (!result.length) {
      throw new Error(`No ConverterStatus found with ID ${id}`);
    }

    return result[0].name;
  }

  /**
   * Updates the status of a converter.
   * @param converterId The ID of the converter to update.
   * @param status The new status of the converter.
   */
  async updateConverterStatus(
    connection: DataSource,
    converterId: number,
    status: ConverterStatus
  ): Promise<void> {
    await connection
      .createQueryBuilder()
      .update('ConverterStatus')
      .set({ status })
      .where('id = :id', { id: converterId })
      .execute();
  }

  /**
   * Updates the start time of a converter.
   * @param converterId The ID of the converter to update.
   */
  async updateConverterStartTime(connection: DataSource, converterId: number): Promise<void> {
    await connection
      .createQueryBuilder()
      .update('ConverterStatus')
      .set({ start_time: new Date() })
      .where('id = :id', { id: converterId })
      .execute();
  }
}
