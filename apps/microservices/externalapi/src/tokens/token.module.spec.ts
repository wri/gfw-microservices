import { Test } from '@nestjs/testing';

import { AppService } from '../app/app.service';
import { TokenModule } from '.';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Token } from './token.entity';
import { TokenService } from './token.service';
/* eslint-disable @typescript-eslint/no-unused-vars */

describe('Test Token Module', () => {
  let service: AppService;
  let tokenService: TokenService;

  beforeAll(async () => {
    const app = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          name: 'default',
          type: 'sqlite',
          database: 'db.default.sqlite',
          synchronize: true,
          logging: true,
          entities: [Token],
        }),
        TypeOrmModule.forRoot({
          name: 'client',
          type: 'sqlite',
          database: 'db.sqlite',
          synchronize: true,
          logging: true,
          entities: [Token],
        }),
        TokenModule,
      ],
      providers: [AppService],
    }).compile();

    /* MISSING: Setup the database */

    service = app.get<AppService>(AppService);
    tokenService = app.get<TokenService>(TokenService);
  });

  xdescribe('Test token creation for premium organzation', () => {
    xit('Should return a new token object and token should be 50 chars long', () => {
      fail('This test has not been implemented yet');
    });

    xit('Should return 5 token objects and token should be 50 chars long', () => {
      fail('This test has not been implemented yet');
    });

    xit('Should deactivate a token and return the active tokens token', () => {
      fail('This test has not been implemented yet');
    });
  });

  xdescribe('Test token service', () => {
    xit('Should return a new token object and token should be 50 chars long', async () => {
      const token = await tokenService.createToken(1558, 1);
      expect(token.tokenValue.length).toEqual(50);
    });
  });
});
