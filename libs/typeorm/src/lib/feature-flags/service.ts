import { DataSource, Repository } from 'typeorm';
import { FeatureFlags } from './entity';

export class FeatureFlagsService {
  private repository: Repository<FeatureFlags>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(FeatureFlags);
  }

  async getAllFeatureFlags(): Promise<FeatureFlags[]> {
    return this.repository.find();
  }

  async getFeatureFlagById(flagId: string): Promise<FeatureFlags | undefined> {
    return this.repository.findOne({ where: { flagId } });
  }

  async createFeatureFlag(data: Partial<FeatureFlags>): Promise<FeatureFlags> {
    const featureFlag = this.repository.create(data);
    return this.repository.save(featureFlag);
  }
}
