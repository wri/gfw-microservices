// src/auth/guards/api-key.guard.ts

import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
const TOKEN_HEADER_NAME = 'x-api-key';

@Injectable()
export class ApiKeyGuard extends AuthGuard('header') {
  constructor(/*private readonly usersService: UsersService*/) {
    super();
  }

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log(request.headers);
    const token = request.headers[TOKEN_HEADER_NAME];

    if (!token) {
      throw new UnauthorizedException('API token not provided');
    }

    const user = await this.validateToken(token);
    request.user = user; // Attach user to the request

    return true;
  }

  async validateToken(token: string) {
    // Implement your database validation logic here
    console.log(token);
    return {
      username: 'admin',
      password: 'admin',
    };
    //await this.usersService.findUserByApiToken(token);
  }
}
