// health.controller.ts
import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { QueueService } from '../list-upload/queue.service';

@Controller('HealthCheck')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,
    private queueService: QueueService
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 4 * 1024 * 1024 * 1024), // 4GB
    ]);
  }

  @Get('queue-stats')
  getQueueStats() {
    const stats = this.queueService.getQueueStats();
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      queue: {
        ...stats,
        utilizationPercent: Math.round((stats.running / stats.concurrency) * 100),
        backlogCount: stats.length,
      },
    };
  }

  @Get('debug')
  getDebugInfo() {
    const detailedStats = this.queueService.getDetailedStats();
    return {
      status: 'debug',
      timestamp: new Date().toISOString(),
      process: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        pid: process.pid,
      },
      queue: detailedStats.queue,
      runningTasks: detailedStats.runningTasks,
      longestRunningTask: detailedStats.longestRunningTask,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        concurrency: process.env.LIST_PROCESSING_CONCURRENCY || '2',
      },
      recommendations: this.getRecommendations(detailedStats),
    };
  }

  @Get('triage')
  async getTriageInfo() {
    try {
      const detailedStats = this.queueService.getDetailedStats();
      const dbStart = Date.now();
      const dbHealth = await this.db.pingCheck('database');
      const dbDuration = Date.now() - dbStart;

      // Determine overall system health
      let systemStatus = 'healthy';
      const alerts = [];
      const warnings = [];

      // Check queue health
      if (detailedStats.queue.length > 10) {
        systemStatus = 'warning';
        warnings.push(`High queue backlog: ${detailedStats.queue.length} pending`);
      }

      if (detailedStats.runningTasks.some((task) => task.durationMinutes > 15)) {
        systemStatus = 'warning';
        warnings.push('Tasks running longer than 15 minutes detected');
      }

      if (detailedStats.runningTasks.some((task) => task.durationMinutes > 25)) {
        systemStatus = 'critical';
        alerts.push('Tasks running longer than 25 minutes - likely stuck');
      }

      // Check database health
      if (dbDuration > 5000) {
        systemStatus = 'warning';
        warnings.push(`Database response slow: ${dbDuration}ms`);
      }

      if (dbHealth.database.status !== 'up') {
        systemStatus = 'critical';
        alerts.push('Database connectivity issues detected');
      }

      // Check memory usage
      const memUsage = process.memoryUsage();
      const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      if (heapUsedMB > 1000) {
        systemStatus = 'warning';
        warnings.push(`High memory usage: ${heapUsedMB}MB`);
      }

      return {
        systemStatus,
        timestamp: new Date().toISOString(),
        summary: {
          queueLength: detailedStats.queue.length,
          runningTasks: detailedStats.queue.running,
          longestRunningMinutes: detailedStats.longestRunningTask?.durationMinutes || 0,
          databaseResponseMs: dbDuration,
          memoryUsageMB: heapUsedMB,
        },
        alerts: alerts.length > 0 ? alerts : [],
        warnings: warnings.length > 0 ? warnings : [],
        quickActions: this.getQuickActions(systemStatus, detailedStats, dbDuration),
        detailedEndpoints: {
          queue: '/api/HealthCheck/queue-stats',
          stuckTasks: '/api/HealthCheck/stuck-tasks',
          database: '/api/HealthCheck/database-health',
          fullDebug: '/api/HealthCheck/debug',
        },
      };
    } catch (error) {
      return {
        systemStatus: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        message: 'Failed to gather triage information',
      };
    }
  }

  @Get('stuck-tasks')
  getStuckTasks() {
    const detailedStats = this.queueService.getDetailedStats();
    const STUCK_THRESHOLD_MINUTES = 15;

    const stuckTasks = detailedStats.runningTasks.filter(
      (task) => task.durationMinutes > STUCK_THRESHOLD_MINUTES
    );

    return {
      status: stuckTasks.length > 0 ? 'warning' : 'ok',
      timestamp: new Date().toISOString(),
      stuckTasksCount: stuckTasks.length,
      stuckTasks,
      thresholdMinutes: STUCK_THRESHOLD_MINUTES,
      message:
        stuckTasks.length > 0
          ? `Found ${stuckTasks.length} tasks running longer than ${STUCK_THRESHOLD_MINUTES} minutes`
          : 'No stuck tasks detected',
    };
  }

  @Get('queue-health')
  getQueueHealth() {
    const stats = this.queueService.getQueueStats();
    const detailedStats = this.queueService.getDetailedStats();

    let status = 'ok';
    const issues = [];

    if (stats.length > 10) {
      status = 'warning';
      issues.push('High queue backlog');
    }

    if (detailedStats.runningTasks.some((task) => task.durationMinutes > 20)) {
      status = 'warning';
      issues.push('Long running tasks detected');
    }

    if (stats.running === stats.concurrency && stats.length > 0) {
      status = 'warning';
      issues.push('Queue at full capacity with backlog');
    }

    return {
      status,
      timestamp: new Date().toISOString(),
      queue: stats,
      issues: issues.length > 0 ? issues : ['No issues detected'],
      runningTasks: detailedStats.runningTasks.length,
      longestRunningMinutes: detailedStats.longestRunningTask?.durationMinutes || 0,
    };
  }

  @Get('database-health')
  async getDatabaseHealth() {
    try {
      const start = Date.now();

      // Simple database connectivity test
      const result = await this.db.pingCheck('database');

      const duration = Date.now() - start;

      return {
        status: result.database.status,
        timestamp: new Date().toISOString(),
        responseTime: `${duration}ms`,
        message:
          duration > 5000
            ? 'Database response time is slow (>5s)'
            : duration > 1000
            ? 'Database response time is acceptable (1-5s)'
            : 'Database response time is good (<1s)',
        details: result,
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        message: 'Database connectivity failed',
      };
    }
  }

  private getRecommendations(stats: any): string[] {
    const recommendations = [];

    if (stats.longestRunningTask && stats.longestRunningTask.durationMinutes > 20) {
      recommendations.push(
        `Task ${stats.longestRunningTask.listId} has been running for ${stats.longestRunningTask.durationMinutes} minutes - investigate logs`
      );
    }

    if (stats.queue.length > 5) {
      recommendations.push(
        `High queue backlog (${stats.queue.length}) - consider increasing concurrency`
      );
    }

    if (stats.queue.running === stats.queue.concurrency && stats.queue.length > 0) {
      recommendations.push('Queue at full capacity with backlog - monitor for stuck tasks');
    }

    return recommendations;
  }

  private getQuickActions(systemStatus: string, stats: any, dbDuration: number): string[] {
    const actions = [];

    if (systemStatus === 'critical') {
      actions.push('🚨 CRITICAL: Restart application if tasks stuck >30min');
      actions.push('🔍 Check logs for specific error messages');
    }

    if (systemStatus === 'warning') {
      if (stats.queue.length > 10) {
        actions.push('⚠️ Consider increasing LIST_PROCESSING_CONCURRENCY');
      }
      if (dbDuration > 5000) {
        actions.push('⚠️ Check database performance and locks');
      }
    }

    if (stats.runningTasks.some((task: any) => task.durationMinutes > 15)) {
      actions.push('📋 Check CREATE_LOCATION_SCHEMA_DEBUG.md for database issues');
      actions.push('🔗 Use /api/HealthCheck/stuck-tasks for detailed task info');
    }

    if (actions.length === 0) {
      actions.push('✅ System healthy - no actions needed');
    }

    return actions;
  }
}
