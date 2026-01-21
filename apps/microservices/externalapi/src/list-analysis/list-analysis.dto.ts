import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { parse, isValid } from 'date-fns';

export const listIdSchema = z.coerce.number();

export class ListAnalysisResponse {
  @ApiProperty()
  listId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  errorsDetails: Array<unknown>;

  @ApiProperty()
  resultUrl: string;

  @ApiProperty()
  creationDate: Date;

  @ApiProperty()
  expirationDate: Date;
}

const dateFormat = z.string().transform((value) => {
  // Try US format first (MM-DD-YYYY)
  let date = parse(value, 'MM-dd-yyyy', new Date());

  // If US format doesn't work, try international format (YYYY-MM-DD)
  if (!isValid(date)) {
    date = parse(value, 'yyyy-MM-dd', new Date());
  }

  if (!isValid(date)) {
    throw new BadRequestException('Invalid date format, use MM-DD-YYYY or YYYY-MM-DD');
  }

  return date;
});

export const alertsGenerateBodySchema = z.object({
  startDate: dateFormat.optional(),
  endDate: dateFormat.optional(),
  userEmail: z.string().email(),
  outputType: z.enum(['verifiableCredential']).optional(),
});

export type AlertsGenerateBodySchema = z.infer<typeof alertsGenerateBodySchema>;

export class AlertsGenerateRequest {
  @ApiProperty({
    example: 'mm-dd-yyyy or yyyy-mm-dd',
  })
  startDate?: Date;

  @ApiProperty({
    example: 'mm-dd-yyyy or yyyy-mm-dd',
  })
  endDate?: Date;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  outputType?: string;
}

export const deleteListBodySchema = z.object({
  userEmail: z.string().email(),
});

export class requestEmailBody {
  @ApiProperty()
  userEmail: string;
}
export class DeleteListRequest extends requestEmailBody {}
export class GenerateFCDDefReportAnalyseBody extends requestEmailBody {}
export const generateFCDDefReportAnalyseBodySchema = z.object({ userEmail: z.string().email() });

export const numPageSchema = z.coerce.number();
export const pageSizeSchema = z.coerce.number();

export interface AnalysesGenerateRequest {
  listId: number;
  analysisId: string;
  organizationId: number;
  userEmail: string;
  startDate: Date;
  endDate: Date;
  outputType?: string;
}

export const reanalyzeAnalysisBodySchema = z.object({
  userEmail: z.string().email(),
});
