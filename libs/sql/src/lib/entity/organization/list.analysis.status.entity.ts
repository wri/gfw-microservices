import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'ListsAnalysisStatus' })
export class ListsAnalysisStatus {
  @PrimaryGeneratedColumn({ name: 'ListID' })
  ListID: number;

  @PrimaryGeneratedColumn({ name: 'AnalysisID' })
  AnalysisID: string;

  @Column({ name: 'Status' })
  Status: number;

  @Column({ name: 'ErrorInfo' })
  ErrorInfo: string;

  @Column({ name: 'UpdateTime' })
  UpdateTime: string;

  @Column({ name: 's3_url' })
  s3Url: string;

  @Column({ name: 'expiration_time' })
  expirationTime: string;

  @Column({ name: 'bundle_creation_time' })
  bundleCreationTime: string;
}
