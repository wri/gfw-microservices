import { DataSource, Repository } from 'typeorm';
import { FeatureFlags } from './entity';

export class FeatureFlagsService {
  private repository: Repository<FeatureFlags>;
  private dataSource: DataSource;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.repository = dataSource.getRepository(FeatureFlags);
  }

  async getAllFeatureFlags(orgId: number): Promise<FeatureFlags[]> {
    let featureFlagsCollection: FeatureFlags[];

    try {
      await this.dataSource.initialize();
      featureFlagsCollection = await this.repository.find({ where: { orgId } });
    } catch (error) {
      throw new Error(error);
    } finally {
      await this.dataSource.destroy();
    }

    return featureFlagsCollection;
  }

  async getFeatureFlagById(flagId: string): Promise<FeatureFlags[]> {
    let featureFlagsCollection: FeatureFlags[];

    try {
      await this.dataSource.initialize();
      featureFlagsCollection = await this.repository.findBy({
        flagId: flagId,
      });
    } catch (error) {
      throw new Error(error);
    } finally {
      await this.dataSource.destroy();
    }

    return featureFlagsCollection;
  }

  async createFeatureFlag(data: Partial<FeatureFlags>): Promise<FeatureFlags> {
    const fieldsWithErrors = this.validateFeatureFlagFields(data);

    if (fieldsWithErrors.length > 0) {
      let featureFlag: FeatureFlags;

      try {
        await this.dataSource.initialize();
        featureFlag = this.repository.create(data);
        await this.repository.insert(featureFlag);
      } catch (error) {
        throw new Error(error);
      } finally {
        await this.dataSource.destroy();
      }

      return featureFlag;
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

    return missingFields;
  }
}
