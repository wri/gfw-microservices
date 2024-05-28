import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ListsAnalysisStatus' })
export class ListsAnalysisStatus {
  @PrimaryGeneratedColumn({ name: 'ListID' })
  listId: number;

  @PrimaryGeneratedColumn({ name: 'AnalysisID' })
  analysisId: string;

  @Column({ name: 'Status' })
  status: number;

  @Column({ name: 'ErrorInfo' })
  errorInfo: string;

  @Column({ name: 'UpdateTime' })
  updateTime: string;

  @Column({ name: 's3_url' })
  s3Url: string;

  @Column({ name: 'expiration_time' })
  expirationTime: string;

  @Column({ name: 'bundle_creation_time' })
  bundleCreationTime: string;
}
