import { Injectable, Logger } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { ListService } from './list.service';

@Injectable()
export class UnlockListService {
  private readonly logger = new Logger(UnlockListService.name);

  constructor(private organizationService: OrganizationService, private listService: ListService) {}

  async execute() {
    this.logger.log('Unlock lists that have been locked for more than 24 hours');

    const organizations = await this.organizationService.findAll();

    for (let i = 0; i < organizations.length; i++) {
      await this.listService.unlockLists(organizations[i]);
    }
  }
}
