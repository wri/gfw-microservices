import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'ListsAnalysisStatus' })
export class ListsAnalysisStatus {
  @PrimaryColumn('int', { name: 'ListID' })
  listId: number;

  @PrimaryColumn('varchar', { name: 'AnalysisID' })
  analysisId: string;

  @Column({ name: 'Status' })
  status: number;

  @Column({ name: 'ErrorInfo', nullable: true })
  errorInfo?: string;

  @Column({ name: 'UpdateTime' })
  updateTime: Date;

  @Column({ name: 's3_url', nullable: true })
  s3URL: string;

  @Column({ name: 'expiration_time', nullable: true })
  expirationTime: Date;

  @Column({ name: 'bundle_creation_time', nullable: true })
  bundleCreationTime: Date;

  @Column({ name: 'options', nullable: true })
  options?: string;

  analysisIdLastModifed?: Date;
}
