import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TokenService } from './token.service';
import { ApiResponse } from '@nestjs/swagger';
import { CreateApiKeyRequest, ViewApiKeyResponse } from './dtos';
import { z } from 'zod';

const paramOrganizationIdSchema = z.number();

@Controller('/api-keys')
export class APIKeyController {
  constructor(private readonly tokenService: TokenService) {}

  //Get all tokens for one organization
  @ApiResponse({ status: 200, type: [ViewApiKeyResponse] })
  @Get('/:organizationId')
  async getTokens(@Param('organizationId') organizationId: number): Promise<ViewApiKeyResponse[]> {
    paramOrganizationIdSchema.parse(organizationId);

    return await this.tokenService.findTokenByOrganizationId(organizationId);
  }

  // Create a new Token
  @ApiResponse({ status: 200, type: ViewApiKeyResponse })
  @Post()
  token(@Body() apiKeyRequest: CreateApiKeyRequest) {
    const apiKeyRequestSchema = z.object({
      organizationId: z.number(),
      userId: z.number()
    })

    const { organizationId, userId } = apiKeyRequestSchema.parse(apiKeyRequest)
    
    return this.tokenService.createToken(organizationId, userId);
  }

  // Delete a token for a organization
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') organizationId: number, @Param('tokenId') tokenId: string) {
    const paramTokenIdSchema = z.string();

    paramOrganizationIdSchema.parse(organizationId);
    paramTokenIdSchema.parse(tokenId);

    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
