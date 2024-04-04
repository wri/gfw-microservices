import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import * as moment from 'moment';

export const listIdSchema = z.coerce.number();

export class ListAnalysisResponse {
  @ApiProperty()
  listId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  errorsDetails: string[];

  @ApiProperty()
  resultUrl: string;

  @ApiProperty()
  creationDate: Date;

  @ApiProperty()
  expirationDate: Date;
}

const dateFormat = z.string().transform((value) => {
  const date = moment(value, 'MM-DD-YYYY', true);

  if (!date.isValid()) {
    throw new BadRequestException('Invalid date format, use MM-DD-YYYY');
  }

  return date.toDate();
});

export const alertsGenerateBodySchema = z.object({
  startDate: dateFormat,
  endDate: dateFormat,
  userEmail: z.string().email(),
});

export type AlertsGenerateBodySchema = z.infer<typeof alertsGenerateBodySchema>;

export class AlertsGenerateRequest {
  @ApiProperty({
    example: 'mm-dd-yyyy',
  })
  startDate: Date;

  @ApiProperty({
    example: 'mm-dd-yyyy',
  })
  endDate: Date;

  @ApiProperty()
  userEmail: string;
}
export const deleteListBodySchema = z.object({
  userEmail: z.string().email(),
});
export type DeleteListBodySchema = z.infer<typeof deleteListBodySchema>;
