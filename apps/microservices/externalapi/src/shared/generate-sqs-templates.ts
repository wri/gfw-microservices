import { generateRandomFilename } from '@wri-monorepos/shared';
import { Organization } from '../api-keys/organization.entity';
import { AlertsGenerateBodySchema } from '../list-analysis/list-analysis.dto';
import * as tmp from 'tmp';

export const generateAlertsSqsTemplate = ({
  startDate,
  endDate,
  organization,
  listId,
}: AlertsGenerateBodySchema & { organization: Organization; listId: number }) => {
  const fileName = generateRandomFilename('');

  const tmpPath = tmp.tmpNameSync();
  const key = tmpPath.slice(tmpPath.lastIndexOf('/') + 1);

  return {
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
      StringValue: startDate.toISOString(),
    },
    endDate: {
      DataType: 'String',
      StringValue: endDate.toISOString(),
    },
  };
};
