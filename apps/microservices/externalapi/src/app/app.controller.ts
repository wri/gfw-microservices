import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { AppService } from './app.service';
import { ApiKeyGuard } from '../api-keys/auth.guard';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  BadRequestResponse,
  ErroResponseWithErroMessage,
  ForbiddenResponse,
  UnauthorizedResponse,
} from '../list-analysis/dtos/apiResponse';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Healthcheck for fargate
   */
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiResponse({ status: 200, type: String })
  @Get('/HealthCheck')
  getHealthCheck(): string {
    return this.appService.getHealthCheck();
  }
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiResponse({ status: 200, type: String })
  @Get('/protected')
  @UseGuards(ApiKeyGuard)
  protectedEndpoint(@Request() req) {
    // This endpoint is protected by the token middleware
    return 'Protected endpoint accessed by user: ' + req.user.username;
  }

  /**
   * Latest commit hash
   */
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiResponse({ status: 200, type: String })
  @Get('/latest_commit')
  getLatestCommit(): string {
    return process.env.NODE_ENV === 'development' ? 'dev' : process.env.LATEST_COMMIT;
  }
}
