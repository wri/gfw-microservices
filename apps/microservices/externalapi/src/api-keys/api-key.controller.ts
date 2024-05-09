import { Body, Controller, Delete, Get, Param, Post, UsePipes } from '@nestjs/common';

import { TokenService } from './token.service';
import {
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CreateApiKeyRequest, ViewApiKeyResponse } from './dtos';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';
import {
  BadRequestResponse,
  ErroResponseWithErroMessage,
  ForbiddenResponse,
  UnauthorizedResponse,
} from '../list-analysis/dtos/apiResponse';

const apiKeyRequestSchema = z.object({
  organizationId: z.number(),
  userId: z.number(),
});

@Controller('/api-keys')
export class APIKeyController {
  constructor(private readonly tokenService: TokenService) {}

  //Get all tokens for one organization
  @ApiResponse({ status: 200, type: [ViewApiKeyResponse] })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @Get('/:organizationId')
  async getTokens(@Param('organizationId') orgId: string): Promise<ViewApiKeyResponse[]> {
    const organizationId = z.coerce.number().parse(orgId);

    const token = await this.tokenService.findTokenByOrganizationId(organizationId);

    return token;
  }

  // Create a new Token
  @ApiResponse({ status: 200, type: ViewApiKeyResponse })
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @Post()
  @UsePipes(new ZodValidationPipe(apiKeyRequestSchema))
  token(@Body() apiKeyRequest: CreateApiKeyRequest) {
    const { organizationId, userId } = apiKeyRequest;

    return this.tokenService.createToken(organizationId, userId);
  }

  // Delete a token for a organization
  @ApiUnauthorizedResponse({ status: 401, type: UnauthorizedResponse })
  @ApiBadRequestResponse({ type: BadRequestResponse })
  @ApiForbiddenResponse({ type: ForbiddenResponse })
  @ApiNotFoundResponse({ type: ErroResponseWithErroMessage })
  @ApiResponse({ status: 204, type: String })
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') orgId: string, @Param('tokenId') tokenId: string) {
    const organizationId = z.coerce.number().parse(orgId);
    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
