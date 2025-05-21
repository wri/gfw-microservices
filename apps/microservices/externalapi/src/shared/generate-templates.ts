import { generateRandomFilename } from '@wri-monorepos/shared';
import { Organization } from '@wri-monorepos/sql';
import * as tmp from 'tmp';

export const generateAnalysisTemplate = ({
  startDate,
  endDate,
  organization,
  listId,
  analysisId = 'ALERTS',
}: {
  startDate?: Date;
  endDate?: Date;
  organization: Organization;
  listId: number;
  analysisId?: string;
}) => {
  const fileName = generateRandomFilename('');

  const tmpPath = tmp.tmpNameSync();
  const key = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  let message = {};

  switch (analysisId) {
    case 'FCD': {
      message = {
        listId,
        listView: 'forest_change',
        type: 'everything',
        key: '${fileName}',
        file: 'csv',
      };
      break;
    }
    case 'AFI': {
      message = {
        listId,
        type: 'afi',
        key: '${fileName}',
      };
      break;
    }
    case 'ALERTS': {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);

      message = {
        listId: `${listId}`,
        type: 'alerts',
        key: `${fileName}`,
        file: 'csv',
        selectedTimeframe: 'DAY',
        selectedAlert: 'Integrated',
        startDate: startDate.toISOString() || currentDate.toISOString(),
        endDate: endDate.toISOString() || thirtyDaysAgo.toISOString(),
      };
      break;
    }
    case 'GHG': {
      message = {
        listId,
        type: 'ghg',
        file: 'csv',
        key: `${fileName}`,
      };
      break;
    }
    default:
      return;
  }
  message = {
    ...message,
    key,
    organizationDatabase: organization.organizationDb,
  };
  return message;
};
