import { RunMode } from '@wri-monorepos/constants';

export interface ConverterJob {
  startTime: Date;
  finishTime: Date | null;
  status: string;
  id: number;
  name: string;
  organizationId: number | null;
  parentId: number | null;
  listId: number | null;
  mode: RunMode;
  isDryRun: boolean;
  totalListsAffected: number | null;
  children: any[];
}

export interface ConvertersData {
  convertersNames: Record<string, string>;
  converterJobs: ConverterJob[];
}
