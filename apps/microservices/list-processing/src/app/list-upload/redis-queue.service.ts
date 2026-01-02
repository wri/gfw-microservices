import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../../validators/server-config';
import { createClient, RedisClientType } from 'redis';
import { EmailService } from '@wri-monorepos/aws';
import { RequestLargeListProcess } from '../../models';

// Serializable task data that can be stored in Redis
type SerializableTask = {
  request: RequestLargeListProcess;
  traceId?: string;
  organizationId?: number;
  userId?: number;
};

// Full worker type with services (not serializable)
type WorkerType = {
  request: RequestLargeListProcess;
  config: ConfigService<ServerConfigType, true>;
  emailService: EmailService;
  traceId?: string;
  organizationId?: number;
  userId?: number;
};

type QueueCallback = (error: Error | null) => void;

/**
 * Redis-based persistent queue service for list processing tasks.
 * Tasks are persisted to Redis and restored on service restart.
 */
@Injectable()
export class RedisQueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisQueueService.name);
  private redisClient: RedisClientType | null = null;
  private isConnected = false;
  private readonly queueKey = 'list-processing:queue';
  private readonly processingKey = 'list-processing:processing';
  private worker: ((input: WorkerType, cb: QueueCallback) => void) | null = null;
  private concurrency = 1;
  private running = 0;
  private processingInterval: NodeJS.Timeout | null = null;
  private configService: ConfigService<ServerConfigType, true> | null = null;
  private emailService: EmailService | null = null;

  constructor(private readonly config: ConfigService<ServerConfigType, true>) {
    this.configService = config;
  }

  /**
   * Set the email service (injected separately to avoid circular dependencies)
   */
  setEmailService(emailService: EmailService): void {
    this.emailService = emailService;
  }

  async onModuleInit() {
    await this.connect();
    await this.restoreTasks();
    this.startProcessing();
  }

  async onModuleDestroy() {
    this.stopProcessing();
    await this.disconnect();
  }

  private async connect(): Promise<void> {
    try {
      const redisHost = this.config.get('REDIS_HOST', { infer: true }) || 'localhost';
      const redisPort = this.config.get('REDIS_PORT', { infer: true }) || 6379;
      const connectTimeout = this.config.get('REDIS_CONNECT_TIMEOUT', { infer: true });

      const redisOptions: Record<string, unknown> = {
        url: `redis://${redisHost}:${redisPort}`,
      };

      if (connectTimeout) {
        redisOptions.socket = {
          connectTimeout: connectTimeout,
        };
      }

      this.redisClient = createClient(redisOptions);

      this.redisClient.on('error', (err) => {
        this.logger.error(`Redis client error: ${err.message}`, err.stack);
        this.isConnected = false;
      });

      this.redisClient.on('connect', () => {
        this.logger.log('Redis client connecting...');
      });

      this.redisClient.on('ready', () => {
        this.logger.log('Redis client ready');
        this.isConnected = true;
      });

      this.redisClient.on('reconnecting', () => {
        this.logger.warn('Redis client reconnecting...');
      });

      await this.redisClient.connect();
      this.isConnected = true;
      this.logger.log(`Connected to Redis at ${redisHost}:${redisPort}`);
    } catch (error) {
      this.logger.error(`Failed to connect to Redis: ${error.message}`, error.stack);
      this.isConnected = false;
      // Don't throw - allow service to start even if Redis is unavailable
      // It will fall back to in-memory behavior
    }
  }

  private async disconnect(): Promise<void> {
    if (this.redisClient && this.isConnected) {
      try {
        await this.redisClient.quit();
        this.logger.log('Disconnected from Redis');
      } catch (error) {
        this.logger.error(`Error disconnecting from Redis: ${error.message}`, error.stack);
      } finally {
        this.isConnected = false;
        this.redisClient = null;
      }
    }
  }

  /**
   * Set the worker function that processes tasks
   */
  setWorker(worker: (input: WorkerType, cb: QueueCallback) => void, concurrency = 1): void {
    this.worker = worker;
    this.concurrency = concurrency;
  }

  /**
   * Push a task to the queue
   */
  async push(task: WorkerType): Promise<void> {
    if (!this.isConnected || !this.redisClient) {
      this.logger.warn('Redis not connected, task will not be persisted');
      // Fallback: process immediately if Redis is unavailable
      if (this.worker) {
        this.processTask(task);
      }
      return;
    }

    try {
      // Only serialize the request, traceId, organizationId, and userId (not the services)
      const serializableTask: SerializableTask = {
        request: task.request,
        traceId: task.traceId,
        organizationId: task.organizationId,
        userId: task.userId,
      };
      const taskJson = JSON.stringify(serializableTask);
      await this.redisClient.lPush(this.queueKey, taskJson);
      this.logger.debug(`Task queued: ${task.request.list_id || 'unknown'}`);
    } catch (error) {
      this.logger.error(`Failed to queue task: ${error.message}`, error.stack);
      // Fallback: process immediately if Redis operation fails
      if (this.worker) {
        this.processTask(task);
      }
    }
  }

  /**
   * Get current queue length
   */
  async length(): Promise<number> {
    if (!this.isConnected || !this.redisClient) {
      return 0;
    }

    try {
      return await this.redisClient.lLen(this.queueKey);
    } catch (error) {
      this.logger.error(`Failed to get queue length: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get number of currently running tasks
   */
  runningCount(): number {
    return this.running;
  }

  /**
   * Get concurrency setting
   */
  getConcurrency(): number {
    return this.concurrency;
  }

  /**
   * Restore tasks from Redis on startup
   */
  private async restoreTasks(): Promise<void> {
    if (!this.isConnected || !this.redisClient) {
      this.logger.warn('Redis not connected, cannot restore tasks');
      return;
    }

    try {
      // Move any tasks from processing back to queue (in case service crashed)
      const processingTasks = await this.redisClient.lRange(this.processingKey, 0, -1);
      if (processingTasks.length > 0) {
        this.logger.log(`Restoring ${processingTasks.length} tasks from processing queue`);
        for (const taskJson of processingTasks.reverse()) {
          await this.redisClient.lPush(this.queueKey, taskJson);
        }
        await this.redisClient.del(this.processingKey);
      }

      // Get queued tasks
      const queuedTasks = await this.redisClient.lLen(this.queueKey);
      if (queuedTasks > 0) {
        this.logger.log(`Found ${queuedTasks} tasks in queue to restore`);
      }
    } catch (error) {
      this.logger.error(`Failed to restore tasks: ${error.message}`, error.stack);
    }
  }

  /**
   * Start processing tasks from the queue
   */
  private startProcessing(): void {
    if (!this.worker) {
      this.logger.warn('No worker set, cannot process tasks');
      return;
    }

    // Process tasks every second
    this.processingInterval = global.setInterval(async () => {
      if (this.running >= this.concurrency) {
        return; // At capacity
      }

      if (!this.isConnected || !this.redisClient) {
        return; // Redis not available
      }

      try {
        // Move task from queue to processing
        const taskJson = await this.redisClient.rPopLPush(this.queueKey, this.processingKey);

        if (!taskJson) {
          return; // No tasks in queue
        }

        const serializableTask: SerializableTask = JSON.parse(taskJson);

        // Reconstruct full worker task with services
        if (!this.configService || !this.emailService) {
          this.logger.error('ConfigService or EmailService not available, cannot process task');
          // Remove from processing queue
          await this.redisClient.lRem(this.processingKey, 1, taskJson);
          return;
        }

        const task: WorkerType = {
          request: serializableTask.request,
          config: this.configService,
          emailService: this.emailService,
          traceId: serializableTask.traceId,
          organizationId: serializableTask.organizationId,
          userId: serializableTask.userId,
        };

        this.running++;

        // Process the task
        if (!this.worker) {
          this.logger.error('Worker not set, cannot process task');
          this.running--;
          await this.redisClient.lRem(this.processingKey, 1, taskJson);
          return;
        }

        this.worker(task, async (error) => {
          this.running--;

          // Remove from processing queue
          if (this.isConnected && this.redisClient) {
            try {
              await this.redisClient.lRem(this.processingKey, 1, taskJson);
            } catch (removeError) {
              this.logger.error(
                `Failed to remove task from processing queue: ${removeError.message}`,
                removeError.stack
              );
            }
          }

          if (error) {
            this.logger.error(`Task processing failed: ${error.message}`, error.stack);
          }
        });
      } catch (error) {
        this.logger.error(`Error processing queue: ${error.message}`, error.stack);
        this.running--;
      }
    }, 1000); // Check every second
  }

  /**
   * Stop processing tasks
   */
  private stopProcessing(): void {
    if (this.processingInterval) {
      global.clearInterval(this.processingInterval);
      this.processingInterval = null;
    }
  }

  /**
   * Process a task directly (fallback when Redis is unavailable)
   */
  private processTask(task: WorkerType): void {
    if (!this.worker) {
      return;
    }

    if (this.running >= this.concurrency) {
      // Queue is at capacity, retry later
      setTimeout(() => this.processTask(task), 1000);
      return;
    }

    this.running++;
    this.worker(task, (error) => {
      this.running--;
      if (error) {
        this.logger.error(`Task processing failed: ${error.message}`, error.stack);
      }
    });
  }
}
