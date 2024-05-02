import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { featureFlagsService } from '@wri-monorepos/shared';

@Injectable()
export class FeatureFlagEnabledGuard implements CanActivate {
  constructor(private readonly flag: string) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { body: any; featureFlag: any }>();
    const clientStoreDatabase =
      request.body.client_store ?? request.body.clientDatabase ?? request.body.client_database;

    const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
      await featureFlagsService();

    const organizationId = await getClientIdByClientStoreDatabaseName(clientStoreDatabase);
    const flags = await getFeatureFlagsForCurrentOrg(organizationId);

    const hasFlagForExternalApiEnabled = flags.some((f) => f.flagId === this.flag);

    // Modify the request body to add a new parameter
    request.featureFlag.featureFlagEnabled = hasFlagForExternalApiEnabled;

    return true;
  }
}
