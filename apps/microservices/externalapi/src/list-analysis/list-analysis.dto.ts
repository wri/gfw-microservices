import { ApiProperty } from '@nestjs/swagger';
export class ListAnalysisResponse {
  @ApiProperty()
  listId: string;
  @ApiProperty()
  status: 'Processing' | 'Completed' | 'Failed';
  @ApiProperty()
  errorsDetails: string[];
  @ApiProperty()
  resultUrl: string;
  @ApiProperty()
  creationDate: Date;
  @ApiProperty()
  expirationDate: Date;
}
