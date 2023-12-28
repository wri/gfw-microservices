import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  UsePipes,
} from '@nestjs/common';

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
  @ApiResponse({ type: [ViewApiKeyResponse] })
  @Get('/:organizationId')
  async getTokens(@Param('organizationId') orgId: string): Promise<ViewApiKeyResponse[]> {
    const organizationId = z.coerce.number().parse(orgId);

    const token = await this.tokenService.findTokenByOrganizationId(organizationId);

    if (token.length === 0) throw new NotFoundException();

    return token;
  }

  // Create a new Token
  @ApiResponse({ type: ViewApiKeyResponse })
  @Post()
  @UsePipes(new ZodValidationPipe(apiKeyRequestSchema))
  token(@Body() apiKeyRequest: CreateApiKeyRequest) {
    const { organizationId, userId } = apiKeyRequest;

    return this.tokenService.createToken(organizationId, userId);
  }

  // Delete a token for a organization
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') orgId: string, @Param('tokenId') tokenId: string) {
    const organizationId = z.coerce.number().parse(orgId);
    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
