import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TokenService } from './token.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateApiKeyRequest, ViewApiKeyResponse } from './dtos';
import { z } from 'zod';

const listAnalysisParamOrganizationIdSchema = z.number();
const listAnalysisParamTokenIdSchema = z.string();

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
  token(@Body() apiKeyRequest: CreateApiKeyRequest) {
    return this.tokenService.createToken(apiKeyRequest.organizationId, apiKeyRequest.userId);
  }

  // Delete a token for a organization
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') organizationId: number, @Param('tokenId') tokenId: string) {
    listAnalysisParamOrganizationIdSchema.parse(organizationId);
    listAnalysisParamTokenIdSchema.parse(tokenId);

    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
