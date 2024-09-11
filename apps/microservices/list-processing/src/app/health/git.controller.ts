// git.controller.ts
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class GitController {
  constructor(private readonly config: ConfigService) {}

  @Get('last-commit')
  async getLastCommit() {
    return this.config.get('NODE_ENV', { infer: true }) === 'development'
      ? 'dev'
      : this.config.get('LATEST_COMMIT');
  }
}
