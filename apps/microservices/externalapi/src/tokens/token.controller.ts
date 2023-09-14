import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import { TokenService } from './token.service';

@Controller('/api-keys')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  //Get all tokens for one organization
  @Get('/:organizationId')
  async getTokens(@Param('organizationId') organizationId: number) {
    return await this.tokenService.findTokenByOrganizationId(organizationId);
  }

  // Create a new Token
  @Post()
  token(@Body('organizationId') organizationId: number, @Body('userId') userId: number) {
    return this.tokenService.createToken(organizationId, userId);
  }

  // WIP
  @Delete('/:organizationId/:tokenId')
  deleteToken(@Param('organizationId') organizationId: number, @Param('tokenId') tokenId: string) {
    return this.tokenService.deleteToken(organizationId, tokenId);
  }
}
