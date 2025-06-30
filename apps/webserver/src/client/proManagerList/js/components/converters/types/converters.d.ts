export interface ConverterJob {
  startTime: Date;
  status: string;
  id: number;
  name: string;
  organizationId: number | null;
  parentId: number | null;
  listId: number | null;
  children: any[];
}

export interface ConvertersData {
  convertersNames: string[];
  converterJobs: ConverterJob[];
}
