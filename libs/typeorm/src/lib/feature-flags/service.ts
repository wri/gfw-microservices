import { DataSource, Repository } from 'typeorm';
import { FeatureFlags } from './entity';

export class FeatureFlagsService {
  private repository: Repository<FeatureFlags>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(FeatureFlags);
  }

  async getAllFeatureFlags(orgId): Promise<FeatureFlags[]> {
    return this.repository.find({ where: { orgId } });
  }

  async getFeatureFlagById(flagId: string): Promise<FeatureFlags | undefined> {
    return this.repository.findOne({ where: { flagId } });
  }

  async createFeatureFlag(data: Partial<FeatureFlags>): Promise<FeatureFlags> {
    const fieldsWithErrors = this.validateFeatureFlagFields(data);

    if (fieldsWithErrors.length > 0) {
      const featureFlag = this.repository.create(data);
      return this.repository.save(featureFlag);
    } else {
      throw new Error(
        `Could not create FeatureFlag record. The following fields are missing: ${fieldsWithErrors.join(
          ', '
        )}`
      );
    }
  }

  private validateFeatureFlagFields(data: Partial<FeatureFlags>): string[] {
    const missingFields: string[] = [];

    if (!data.flagId || typeof data.flagId !== 'string') {
      missingFields.push('flagId');
    }
    if (data.orgId !== null && typeof data.orgId !== 'number') {
      missingFields.push('orgId');
    }
    if (typeof data.flagState !== 'boolean') {
      missingFields.push('flagState');
    }
    if (typeof data.modifierUserId !== 'number') {
      missingFields.push('modifierUserId');
    }
    if (!(data.updateDateTime instanceof Date)) {
      missingFields.push('updateDateTime');
    }

    return missingFields;
  }
}
