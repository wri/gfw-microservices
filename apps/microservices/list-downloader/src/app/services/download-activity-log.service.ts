import { Injectable, Logger } from '@nestjs/common';
import { ListActivityTypesEnum } from '@wri-monorepos/constants';
import { ActivityLog, ClientStoreConnection, User } from '@wri-monorepos/sql';

export interface DownloadActivityLogData {
  organizationDatabase: string;
  userEmail: string;
  listId: number;
  listName: string;
  fileType: 'csv' | 'shapefile' | 'json';
  downloadType: string; // e.g., 'input', 'results', 'afi', 'alerts', etc.
  analysisType?: string; // for diagnostics, e.g., 'commodityRiskDiagnosticLocationSummary'
  source?: 'listDetails' | 'landing' | 'dashboard' | 'diagnostics'; // Where the download was triggered from
}

@Injectable()
export class DownloadActivityLogService {
  private readonly logger = new Logger(DownloadActivityLogService.name);

  constructor(private readonly clientStoreConnection: ClientStoreConnection) {}

  async logDownloadActivity(data: DownloadActivityLogData): Promise<void> {
    const {
      organizationDatabase,
      userEmail,
      listId,
      listName,
      fileType,
      downloadType,
      analysisType,
      source,
    } = data;

    if (!organizationDatabase || !userEmail) {
      this.logger.warn(
        `Skipping activity log: missing required data (organizationDatabase=${organizationDatabase}, userEmail=${userEmail})`
      );
      return;
    }

    try {
      const connection = await this.clientStoreConnection.getConnection(organizationDatabase);

      // Get user ID from email
      const userRepository = connection.getRepository(User);
      const user = await userRepository.findOne({ where: { email: userEmail } });

      if (!user) {
        this.logger.warn(
          `Cannot log activity: user not found for email ${userEmail} in ${organizationDatabase}`
        );
        return;
      }

      const activityLogRepository = connection.getRepository(ActivityLog);

      const activityDescription = this.buildActivityDescription(
        listId,
        listName,
        fileType,
        downloadType,
        analysisType,
        source
      );

      const activityTypeId = this.getActivityTypeId(source);

      await activityLogRepository.save({
        userId: user.id,
        activityTypeId,
        activityDescription,
        activityTime: new Date(),
      });

      this.logger.log(
        `Download activity logged for user ${userEmail} (ID: ${user.id}), list ${listId}, type: ${fileType}, downloadType: ${downloadType}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to log download activity for list ${listId}: ${error.message}`,
        error.stack
      );
      // Don't throw error - logging failure shouldn't break the download
    }
  }

  private getActivityTypeId(
    source?: 'listDetails' | 'landing' | 'dashboard' | 'diagnostics'
  ): number {
    const sourceToActivityTypeMap = {
      listDetails: ListActivityTypesEnum.ListDetailsDownload,
      landing: ListActivityTypesEnum.ListLandingDownload,
      dashboard: ListActivityTypesEnum.ListDetailsDownload,
      diagnostics: ListActivityTypesEnum.ListDiagnosticsDownload,
    };

    if (source in sourceToActivityTypeMap) {
      return sourceToActivityTypeMap[source];
    } else {
      this.logger.warn(
        `Unknown or undefined download source "${source}", defaulting to ListDetailsDownload (activity type ${ListActivityTypesEnum.ListDetailsDownload}).`
      );
      return ListActivityTypesEnum.ListDetailsDownload;
    }
  }

  private buildActivityDescription(
    listId: number,
    listName: string,
    fileType: 'csv' | 'shapefile' | 'json',
    downloadType: string,
    analysisType?: string,
    source?: 'listDetails' | 'landing' | 'dashboard' | 'diagnostics'
  ): string {
    const fileTypeDisplay =
      fileType === 'csv' ? 'CSV' : fileType === 'shapefile' ? 'Shapefile' : 'JSON';
    const sourceDisplay = source ? ` from ${this.getSourceDisplayName(source)}` : '';

    let description = `List Download${sourceDisplay}: ${fileTypeDisplay} for list "${listName}" (ID: ${listId})`;

    if (downloadType && downloadType !== 'input') {
      description += `, Type: ${downloadType}`;
    }

    if (analysisType) {
      description += `, Analysis: ${analysisType}`;
    }

    return description;
  }

  private getSourceDisplayName(
    source: 'listDetails' | 'landing' | 'dashboard' | 'diagnostics'
  ): string {
    const displayNames = {
      listDetails: 'List Details',
      landing: 'Landing Page',
      dashboard: 'Dashboard',
      diagnostics: 'Diagnostics',
    };
    return displayNames[source] || 'Unknown';
  }
}
