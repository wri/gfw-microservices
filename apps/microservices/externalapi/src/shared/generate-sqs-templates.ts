import { generateRandomFilename } from '@wri-monorepos/shared';
import { Organization } from '../api-keys/organization.entity';
import * as tmp from 'tmp';

export const generateAnalysisSqsTemplate = ({
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

  let sqsMessage = {};

  switch (analysisId) {
    case 'FCD':
    case 'AFI': {
      sqsMessage = {
        list: {
          DataType: 'String',
          StringValue:
            analysisId === 'FCD'
              ? `{"listId":${listId},"listView":"forest_change"}`
              : `{"listId":${listId}}`,
        },
        file: {
          DataType: 'String',
          StringValue:
            analysisId === 'FCD'
              ? `{"type":"everything","key":"${fileName}","file":"csv"}`
              : `{"type":"afi","key":"${fileName}"}`,
        },
      };
      break;
    }
    case 'ALERTS': {
      const currentDate = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(currentDate.getDate() - 30);

      sqsMessage = {
        list: {
          DataType: 'String',
          StringValue: `{"listId":${listId}}`,
        },
        file: {
          DataType: 'String',
          StringValue: `{"type":"alerts","key":"${fileName}","file":"csv"}`,
        },
        selectedTimeframe: {
          DataType: 'String',
          StringValue: 'DAY',
        },
        selectedAlert: {
          DataType: 'String',
          StringValue: 'Integrated',
        },
        startDate: {
          DataType: 'String',
          StringValue: startDate.toISOString() || currentDate.toISOString(),
        },
        endDate: {
          DataType: 'String',
          StringValue: endDate.toISOString() || thirtyDaysAgo.toISOString(),
        },
      };
      break;
    }
    default:
      return;
  }
  sqsMessage = {
    ...sqsMessage,
    key: { DataType: 'String', StringValue: key },
    organizationDatabase: { DataType: 'String', StringValue: organization.organizationDb },
  };
  return sqsMessage;
};
