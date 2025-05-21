import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRoutes } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRoutes, 'default') private userRepository: Repository<UserRoutes>
  ) {}

  async findUser(organizationId: number, userEmail: string): Promise<UserRoutes> {
    return await this.userRepository.findOne({
      where: { organization_id: organizationId, user_email: userEmail },
    });
  }

  async findUserByAttributes(attributes: Partial<UserRoutes>): Promise<UserRoutes> {
    return await this.userRepository.findOne({
      where: attributes,
    });
  }
}
