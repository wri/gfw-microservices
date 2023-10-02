import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../api-keys/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User, 'client') private userRepository: Repository<User>) {}

  async findUser(userEmail: string): Promise<User> {
    return await this.userRepository.findOne({ where: { email: userEmail } });
  }
}
