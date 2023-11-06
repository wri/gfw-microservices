import { DataSource, Repository } from 'typeorm';
import { FeatureFlags } from './entity';

export function createFeatureFlagsService(dataSource: DataSource) {
  const repository: Repository<FeatureFlags> = dataSource.getRepository(FeatureFlags);

  async function initializeExecuteAndCleanUp<T>(callback: () => Promise<T>) {
    let result: T;

    try {
      await dataSource.initialize();
      result = await callback();
    } catch (error) {
      throw new Error(error);
    } finally {
      await dataSource.destroy();
    }

    return result;
  }

  async function getFeatureFlagWhere(where = {}) {
    return initializeExecuteAndCleanUp<FeatureFlags[]>(async () => {
      return repository.find({ where });
    });
  }

  async function getFeatureFlagsForCurrentOrg(orgId: number) {
    const mergedFeatureFlags = new Map();
    const globalFeatureFlags = await getFeatureFlagWhere({ orgId: null });
    const currentOrgFeatureFlags = await getFeatureFlagWhere({ orgId });

    for (const flag of currentOrgFeatureFlags) {
      mergedFeatureFlags.set(flag.flagId, flag);
    }

    for (const flag of globalFeatureFlags) {
      if (!mergedFeatureFlags.has(flag.flagId)) {
        mergedFeatureFlags.set(flag.flagId, flag);
      }
    }

    return [...mergedFeatureFlags.values()];
  }

  async function getFeatureFlagsByFlagId(flagId: string) {
    return getFeatureFlagWhere({ flagId });
  }

  async function createFeatureFlag(data: Partial<FeatureFlags>) {
    const fieldsWithErrors = validateFeatureFlagFields(data);

    if (fieldsWithErrors.length < 1) {
      return initializeExecuteAndCleanUp<FeatureFlags>(async () => {
        const featureFlag = repository.create(data);
        await repository.save(featureFlag);
        return featureFlag;
      });
    }

    throw new Error(
      `Could not create FeatureFlag record. The following fields are missing: ${fieldsWithErrors.join(
        ', '
      )}`
    );
  }

  function validateFeatureFlagFields(data: Partial<FeatureFlags>): string[] {
    const missingFields = [];

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

  return {
    getFeatureFlagsForCurrentOrg,
    getFeatureFlagsByFlagId,
    createFeatureFlag,
  };
}
