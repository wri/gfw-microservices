/**
 * Repository responsible for all direct interactions with the database
 * related to converters.
 */
import { Injectable } from '@nestjs/common';
import { DataSource, MoreThanOrEqual } from 'typeorm';
import { ConverterStatus } from '@wri-monorepos/constants';
import { Organization } from '@wri-monorepos/sql';
import { ConverterStatus as ConverterStatusEntity } from '@wri-monorepos/sql';

@Injectable()
export class ConverterRepository {
  /**
   * Retrieves the client stores associated with a given organization ID.
   * @param connection The database connection to use.
   * @param organizationId The ID of the organization to filter by (optional).
   * @returns A list of client store database names.
   */
  async getClientStoresByOrgId(
    connection: DataSource,
    { isContinueMode, organizationId }: { isContinueMode: boolean; organizationId?: number }
  ): Promise<{ id: number; organizationDb: string }[]> {
    const orgRepo = connection.getRepository(Organization);

    let whereClause = {};
    if (organizationId !== null && organizationId !== undefined) {
      whereClause = isContinueMode
        ? { id: MoreThanOrEqual(organizationId) } // For continue mode, fetch all orgs with ID >= organizationId
        : { id: organizationId };
    }

    const organizations = await orgRepo.find({
      select: ['id', 'organizationDb'],
      where: whereClause,
      order: { id: 'ASC' },
    });

    return organizations.map((org) => ({
      id: org.id,
      organizationDb: org.organizationDb,
    }));
  }

  /**
   * Records an error in the ConverterStatus table.
   * @param name The name of the converter that encountered the error.
   * @param connection The database connection to use.
   * @param parentJobId The ID of the parent converter status.
   * @param errorMessage The error message to record.
   * @param organizationId The ID of the organization where the error occurred.
   * @param listId The ID of the list associated with the error.
   */
  async recordError(
    name: string,
    connection: DataSource,
    parentJobId: number,
    errorMessage: string,
    organizationId: number,
    listId: number
  ): Promise<void> {
    await connection.getRepository(ConverterStatusEntity).insert({
      name,
      parentId: parentJobId,
      organizationId: organizationId,
      listId,
      status: 'FAILED',
      errorDetails: errorMessage,
      startTime: new Date(),
    });
  }

  /**
   * Retrieves the name of the converter based on its ID.
   * @param connection The connection to the GFW Pro database.
   * @param id The ID of the converter.
   * @returns The name of the converter.
   */
  async getConverterName(connection: DataSource, id: number): Promise<string> {
    const record = await connection.getRepository(ConverterStatusEntity).findOne({
      select: ['name'],
      where: { id },
    });

    if (!record) {
      throw new Error(`No ConverterStatus found with ID ${id}`);
    }

    return record.name;
  }

  /**
   * Updates the status of a converter.
   * @param connection The database connection to use.
   * @param converterId The ID of the converter to update.
   * @param status The new status of the converter.
   * @param errorDetails Optional error details if the status is not successful.
   * @returns A promise that resolves when the update is complete.
   */
  async updateConverterStatus(
    connection: DataSource,
    converterId: number,
    status: ConverterStatus,
    errorDetails?: string
  ): Promise<void> {
    await connection.getRepository(ConverterStatusEntity).update(converterId, {
      status,
      errorDetails: errorDetails ?? null,
    });
  }

  /**
   * Updates the start time of a converter.
   * @param connection The database connection to use.
   * @param converterId The ID of the converter to update.
   */
  async updateConverterStartTime(connection: DataSource, converterId: number): Promise<void> {
    await connection
      .getRepository(ConverterStatusEntity)
      .update({ id: converterId }, { startTime: new Date() });
  }

  /**
   * Checks if a converter is currently stopped.
   * @param connection The database connection to use.
   * @param converterId The ID of the converter to check.
   * @returns A boolean indicating whether the converter is stopped.
   */
  async isConverterStopped(connection: DataSource, converterId: number): Promise<boolean> {
    const currentStatus = await connection
      .getRepository(ConverterStatusEntity)
      .findOneBy({ id: converterId });
    return currentStatus.status === ConverterStatus.STOPPED;
  }
}
