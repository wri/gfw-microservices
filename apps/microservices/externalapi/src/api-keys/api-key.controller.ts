import { Body, Controller, Delete, Get, Param, Post, UsePipes } from '@nestjs/common';

import { TokenService } from './token.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateApiKeyRequest, ViewApiKeyResponse } from './dtos';
import { z } from 'zod';
import { ZodValidationPipe } from '../middleware/zod.middleware';

const apiKeyRequestSchema = z.object({
  organizationId: z.number(),
  userId: z.number(),
});

@Controller('/api-keys')
export class APIKeyController {
  constructor(private readonly tokenService: TokenService) {}

  //Get all tokens for one organization
  @ApiResponse({ status: 200, type: [ViewApiKeyResponse] })
  @Get('/:organizationId')
  async getTokens(@Param('organizationId') organizationId: number): Promise<ViewApiKeyResponse[]> {
    return await this.tokenService.findTokenByOrganizationId(organizationId);
  }

  // Create a new Token
  @ApiResponse({ status: 200, type: ViewApiKeyResponse })
  @Post()
  @UsePipes(new ZodValidationPipe(apiKeyRequestSchema))
  token(@Body() apiKeyRequest: CreateApiKeyRequest) {
    const { organizationId, userId } = apiKeyRequest;

    return this.tokenService.createToken(organizationId, userId);
  }

  // Delete a token for a organization
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') organizationId: number, @Param('tokenId') tokenId: string) {
    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
