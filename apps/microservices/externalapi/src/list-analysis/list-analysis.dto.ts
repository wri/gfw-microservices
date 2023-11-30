import { ApiProperty } from '@nestjs/swagger';
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
