import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';

import { TokenService } from './token.service';

@Controller('/api-keys')
export class TokenController {
  constructor (private readonly tokenService: TokenService) { }

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
  @Delete('/delete/:organizationId')
  deleteToken(@Param('organizationId') organizationId: number, @Body('tokenId') tokenId: string) {
    return this.tokenService.deleteToken(organizationId, tokenId);
  }

  @Patch('/update/:organizationId/:tokenValue')
  updateToken(
    @Param('organizationId') organizationId: number,
    @Param('tokenValue') tokenValue: string
  ) {
    console.log(organizationId, tokenValue);
    return false;
  }

  @Get('/getorgs')
  async getOrgs() {
    return await this.tokenService.getOrgs();
  }
}
