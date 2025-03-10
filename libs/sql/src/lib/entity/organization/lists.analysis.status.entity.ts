import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ListsAnalysisStatus' })
export class ListsAnalysisStatus {
  @PrimaryColumn('int', { name: 'ListID' })
  listId: number;

  @PrimaryColumn('varchar', { name: 'AnalysisID' })
  analysisId: string;

  @Column({ name: 'Status' })
  status: number;

  @Column({ name: 'ErrorInfo' })
  errorInfo?: string;

  @Column({ name: 'UpdateTime' })
  updateTime: Date;

  @Column({ name: 's3_url' })
  s3URL: string;

  @Column({ name: 'expiration_time' })
  expirationTime: Date;

  @Column({ name: 'bundle_creation_time' })
  bundleCreationTime: Date;

  @Column({ name: 'options', nullable: true })
  options?: string;

  analysisIdLastModifed?: Date;
}
