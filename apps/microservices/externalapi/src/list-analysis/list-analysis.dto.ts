import { ApiProperty } from '@nestjs/swagger';
export class ListAnalysisResponse {
  @ApiProperty()
  listId: number;
  @ApiProperty()
  status: 'Processing' | 'Completed' | 'Failed';
  @ApiProperty()
  errorsDetails: string[];
  @ApiProperty()
  resultUrl: string;
  @ApiProperty()
  creationDate: Date;
  @ApiProperty()
  expirationDate: string;
}
