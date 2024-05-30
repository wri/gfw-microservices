import { generateRandomFilename } from '@wri-monorepos/shared';
import { Organization } from '../api-keys/organization.entity';
import * as tmp from 'tmp';

export const generateAlertsSqsTemplate = ({
  startDate,
  endDate,
  organization,
  listId,
  analysisId = 'ALERTS',
  userEmail = null,
}: {
  startDate?: Date;
  endDate?: Date;
  organization: Organization;
  listId: number;
  analysisId?: string;
  userEmail?: string;
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
        organizationDatabase: {
          DataType: 'String',
          StringValue: organization.organizationDb,
        },
        analysisId: {
          DataType: 'String',
          StringValue: analysisId,
        },
        userEmail: {
          DataType: 'String',
          StringValue: userEmail,
        },
        file: {
          DataType: 'String',
          StringValue:
            analysisId === 'FCD'
              ? `{"type":"everything","key":"${fileName}","file":"csv"}`
              : `{"type":"afi","key":"${fileName}"}`,
        },
        key: {
          DataType: 'String',
          StringValue: key,
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
        organizationDatabase: {
          DataType: 'String',
          StringValue: organization.organizationDb,
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
        key: {
          DataType: 'String',
          StringValue: key,
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

  return sqsMessage;
};
