import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { ApiKeyGuard } from '../api-keys/auth.guard';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ServerConfigType } from '../validators/server-config';

//We need this annotation to avoid this controller to be shown on Swagger docs
@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private readonly config: ConfigService<ServerConfigType, true>) {}

  @Get('/protected')
  @UseGuards(ApiKeyGuard)
  protectedEndpoint(@Request() req) {
    // This endpoint is protected by the token middleware
    return 'Protected endpoint accessed by user: ' + req.user.username;
  }
}
