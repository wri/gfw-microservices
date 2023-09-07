import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  generateAPIToken(): string {
    // Generate a random API token with the desired length
    const tokenLength = 50;
    return crypto.randomBytes(tokenLength).toString('hex');
  }
}
