import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ListsAnalysisStatus' })
export class ListsAnalysisStatus {
  @PrimaryColumn({ name: 'ListID' })
  listId: number;

  @Column({ name: 'AnalysisID' })
  analysisId: string;

  @Column({ name: 'Status' })
  status: number;

  @Column({ name: 'ErrorInfo' })
  errorInfo?: string;

  @Column({ name: 'UpdateTime' })
  updateTime: Date;
}
