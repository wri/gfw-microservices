import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { EmailService } from '@wri-monorepos/aws';
import fastq from 'fastq';
import type { queue, done } from 'fastq';
import { RequestLargeListProcess } from '../../models';
import { workerPromise as listWorkerPromise } from './list.worker';
import { clearTimeout, setInterval } from 'timers';

type WorkerInput = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
  emailService: EmailService;
  resolve: (value: any) => void;
  reject: (error: any) => void;
};

@Injectable()
export class QueueService {
  private static instance: QueueService;
  private readonly logger = new Logger(QueueService.name);
  private queue: queue<WorkerInput>;
  private readonly MAX_CONCURRENCY = 5;
  private runningTasks: Map<
    string,
    { listId: number; startTime: number; currentHandler?: string }
  > = new Map();

  constructor() {
    if (QueueService.instance) {
      return QueueService.instance;
    }

    // Initialize the global queue with controlled concurrency
    const concurrency = Math.min(
      parseInt(process.env.LIST_PROCESSING_CONCURRENCY || '2', 10),
      this.MAX_CONCURRENCY
    );

    this.queue = fastq(this.worker.bind(this), concurrency);

    // Add periodic queue health logging
    setInterval(() => {
      const stats = this.getQueueStats();
      if (stats.running > 0 || stats.length > 0) {
        this.logger.log(`Queue Health: ${JSON.stringify(stats)}`);

        // Log details about running tasks
        const detailedStats = this.getDetailedStats();
        if (detailedStats.runningTasks.length > 0) {
          detailedStats.runningTasks.forEach((task) => {
            this.logger.log(`  Running: List ${task.listId} for ${task.durationMinutes}min`);
          });
        }
      }
    }, 30000); // Log every 30 seconds if there's activity

    this.logger.log(`Global queue initialized with concurrency: ${concurrency}`);
    QueueService.instance = this;
  }

  static getInstance(): QueueService {
    if (!QueueService.instance) {
      QueueService.instance = new QueueService();
    }
    return QueueService.instance;
  }

  async processRequest(
    request: RequestLargeListProcess,
    config: ConfigService<ServerConfigType, true>,
    emailService: EmailService
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const queueLength = this.queue.length();
      const runningTasks = this.queue.running();
      const startTime = Date.now();

      this.logger.log(
        `Queuing request for list ${request.list_id}. Queue length: ${queueLength}, Running: ${runningTasks}`
      );

      // Add timeout handling for queued requests (30 minutes)
      const timeoutId = setTimeout(() => {
        const timeoutError = new Error(
          `Request timeout for list ${request.list_id} after 30 minutes`
        );
        this.logger.error(`List ${request.list_id} timed out after 30 minutes`);
        reject(timeoutError);
      }, 30 * 60 * 1000);

      // Wrap resolvers with cleanup and metrics
      const wrappedResolve = (value: any) => {
        clearTimeout(timeoutId);
        const processingTime = Date.now() - startTime;
        this.logger.log(`List ${request.list_id} completed in ${processingTime}ms`);
        resolve(value);
      };

      const wrappedReject = (error: any) => {
        clearTimeout(timeoutId);
        const processingTime = Date.now() - startTime;
        const finalError = error || new Error(`Unknown error for list ${request.list_id}`);
        this.logger.error(
          `List ${request.list_id} failed after ${processingTime}ms:`,
          finalError.message
        );
        reject(finalError);
      };

      // Add request to queue
      this.queue.push({
        request,
        config,
        emailService,
        resolve: wrappedResolve,
        reject: wrappedReject,
      });
    });
  }

  private async worker(input: WorkerInput, cb: done): Promise<void> {
    const { request, config, emailService, resolve, reject } = input;
    const { list_id: listId } = request;
    const taskId = `task-${listId}-${Date.now()}`;

    this.logger.log(`Starting processing for list ${listId}`);

    // Track the running task
    this.runningTasks.set(taskId, {
      listId,
      startTime: Date.now(),
    });

    try {
      // Execute the actual processing using promise-based worker
      this.logger.debug(`List ${listId}: Starting listWorkerPromise execution`);
      await listWorkerPromise({ request, config, emailService });
      this.logger.debug(`List ${listId}: Completed listWorkerPromise execution`);

      // Clean up and resolve
      this.runningTasks.delete(taskId);
      this.logger.log(`Successfully processed list ${listId}`);

      // Complete the Promise first
      resolve({
        executionArn: '',
        startDate: new Date().toISOString(),
      });

      // Signal fastq that the job is done (success)
      this.logger.debug(`List ${listId}: Calling cb(null) to complete fastq task`);
      cb(null);
    } catch (error) {
      // Clean up on error
      this.runningTasks.delete(taskId);

      // Ensure we have a proper error object
      const finalError = error || new Error(`Unknown error processing list ${listId}`);

      this.logger.error(`Failed to process list ${listId}:`, finalError.message);
      this.logger.debug(`Error details for list ${listId}:`, finalError);

      // Complete the Promise with error first
      reject(finalError);

      // Signal fastq that the job failed
      this.logger.debug(`List ${listId}: Calling cb(error) to complete fastq task with error`);
      cb(finalError);
    }
  }

  // Monitoring methods
  getQueueStats() {
    return {
      length: this.queue.length(),
      running: this.queue.running(),
      concurrency: this.queue.concurrency,
    };
  }

  // Detailed debugging information
  getDetailedStats() {
    const now = Date.now();
    const runningTasksInfo = Array.from(this.runningTasks.entries()).map(([taskId, task]) => ({
      taskId,
      listId: task.listId,
      durationMs: now - task.startTime,
      durationMinutes: Math.round(((now - task.startTime) / 1000 / 60) * 10) / 10,
      currentHandler: task.currentHandler || 'unknown',
      startTime: new Date(task.startTime).toISOString(),
    }));

    return {
      queue: this.getQueueStats(),
      runningTasks: runningTasksInfo,
      longestRunningTask:
        runningTasksInfo.length > 0
          ? runningTasksInfo.reduce((longest, current) =>
              current.durationMs > longest.durationMs ? current : longest
            )
          : null,
    };
  }

  // Graceful shutdown
  async drain(): Promise<void> {
    this.logger.log('Draining queue for graceful shutdown...');
    return this.queue.drain();
  }

  // Health check method
  isHealthy(): boolean {
    const stats = this.getQueueStats();
    // Consider unhealthy if too many tasks are queued
    return stats.length < 10;
  }
}
