
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';

import { TokenService } from './token.service';

@Controller("/token")
export class TokenController {
  constructor (private readonly tokenService: TokenService) { }

  @Get('/organization/:organizationId')
  getTokens(@Param('organizationId') organizationId: number) {
    console.log(organizationId);
    return false;
  }

  @Post('/create/:organizationId')
  token(@Param('organizationId') organizationId: number, @Body('userId') userId: number) {
    // This endpoint is protected by the token middleware
    console.log(organizationId, userId);
    return this.tokenService.createToken(organizationId, userId)
  }

  @Patch('/update/:organizationId/:tokenValue')
  updateToken(@Param('organizationId') organizationId: number, @Param('tokenValue') tokenValue: string) {
    // This endpoint is protected by the token middleware
    console.log(organizationId, tokenValue);
    return false;
  }

  @Get('/getorgs')
  async getOrgs() {
    return await this.tokenService.createToken(45, 56)
    return await this.tokenService.getOrgs();
  }

}
