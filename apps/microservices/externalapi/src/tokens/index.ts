// src/user/user.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenService } from './token.service';

import { AuthService } from './auth.service';
import { TokenController } from './token.controller';
import { Organization } from './organization.entity';
import { ConfigModule } from '@nestjs/config';
import { User } from './user.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Organization], 'default'),
    TypeOrmModule.forFeature([Token, User], 'client'),
    ConfigModule,
  ],
  providers: [TokenService, AuthService],
  exports: [TokenService, AuthService],
  controllers: [TokenController],
})
export class TokenModule { }
