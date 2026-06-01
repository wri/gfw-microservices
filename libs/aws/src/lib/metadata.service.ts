// src/metadata/metadata.service.ts

import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { map } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export interface MetadataServiceType {
  Cluster: string;
  TaskARN: string;
  Family: string;
  Revision: string;
  DesiredStatus: string;
  KnownStatus: string;
  Containers: Container[];
  Limits: Limits;
  PullStartedAt: string;
  PullStoppedAt: string;
  AvailabilityZone: string;
}

export interface Container {
  DockerId: string;
  Name: string;
  DockerName: string;
  Image: string;
  ImageID: string;
  Labels: Labels;
  DesiredStatus: string;
  KnownStatus: string;
  Limits: Limits;
  CreatedAt: string;
  StartedAt: string;
  Type: string;
  Networks: Network[];
  Health: Health;
}

export interface Labels {
  'com.amazonaws.ecs.cluster': string;
  'com.amazonaws.ecs.container-name': string;
  'com.amazonaws.ecs.task-arn': string;
  'com.amazonaws.ecs.task-definition-family': string;
  'com.amazonaws.ecs.task-definition-version': string;
}

export interface Network {
  NetworkMode: string;
  IPv4Addresses: string[];
}

export interface Health {
  status: string;
  statusSince: string;
  output: string;
}

export interface Limits {
  CPU: number;
  Memory?: number;
}

@Injectable()
export class MetadataService {
  private readonly metadataUrl = 'http://169.254.170.2/v2/metadata';

  constructor(private readonly httpService: HttpService, private config: ConfigService) {}

  async getMetadata(): Promise<{ taskARN: string }> {
    const env = this.config.get<string>('MICROSERVICES_ENV');

    if (env == undefined || ['test', 'dev', 'development', 'latest'].includes(env.toLowerCase())) {
      return { taskARN: `arn:aws:ecs:us-east-1:123456789012:task/cluster-name/uuid-${env ?? ''}` };
    }

    try {
      const response = await firstValueFrom(
        this.httpService
          .get(this.metadataUrl)
          .pipe(map((response) => response.data as MetadataServiceType))
      );

      const taskARN = response.TaskARN;

      return { taskARN };
    } catch (error) {
      throw new Error(`Failed to fetch metadata: ${error.message}`);
    }
  }
}
