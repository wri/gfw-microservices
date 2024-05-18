import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { featureFlagsService } from '@wri-monorepos/shared';

/**
 * @description Base guard to handle common feature flag checking logic,
 * because the logic is the same for both guards
 */
@Injectable()
abstract class BaseFeatureFlagGuard implements CanActivate {
  constructor(protected readonly flag: string) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { body: any; featureFlag?: any }>();
    const clientStoreDatabase =
      request.body.client_store ?? request.body.clientDatabase ?? request.body.client_database;

    if (!clientStoreDatabase) {
      return false;
    }

    const { getFeatureFlagsForCurrentOrg, getClientIdByClientStoreDatabaseName } =
      await featureFlagsService();

    const organizationId = await getClientIdByClientStoreDatabaseName(clientStoreDatabase);
    const flags = await getFeatureFlagsForCurrentOrg(organizationId);

    return flags.some((f) => f.flagId === this.flag && f.flagState === true);
  }
}

/**
 * @description Guard to add a parameter to the request when the feature flag is enabled
 * this is usefull when you want to check the flag state in the controller or pass it to the service
 * you need to add `@Request() req` to the controller method to access the feature flag state in the request and use it
 * like if (req.featureFlag.enabled) { // do something }
 *
 * @example In post method `createList(@Body() request: CreateListRequest, @Request() req) {
 * if (req.featureFlag.enabled) { // do something }
 *   return this.listService.createNewList(request);
 * }`
 *
 * @example In get method `createList(@Request() req) {
 * if (req.featureFlag.enabled) { // do something }
 *   return this.listService.getLists();
 * }`
 */
@Injectable()
export class FeatureFlagEnabledGuard extends BaseFeatureFlagGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasFlagEnabled = await super.canActivate(context);
    const request = context.switchToHttp().getRequest<Request & { featureFlag: any }>();
    // Modify the request body to add a new parameter indicating the feature flag state
    request.featureFlag = { enabled: hasFlagEnabled };
    return true; // Allows request to proceed regardless of flag state
  }
}

/**
 * @description Guard to block the request when the feature flag is not enabled
 * returns 403 Forbidden when the feature flag is not enabled, continues the request when the flag is enabled
 */
@Injectable()
export class FeatureFlagCheckGuard extends BaseFeatureFlagGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const hasFlagEnabled = await super.canActivate(context);

    // Blocks the request if the feature flag is not enabled
    return hasFlagEnabled;
  }
}
