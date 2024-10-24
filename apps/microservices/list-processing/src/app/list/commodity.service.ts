// src/example/example.service.ts

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListTemplate } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';

@Injectable()
export class CommodityService {
  @InjectRepository(ListTemplate, 'default')
  private listTemplateRepository: Repository<ListTemplate>;

  async findAllTemplate(): Promise<ListTemplate[]> {
    const listTemplate = await this.listTemplateRepository.find();
    return listTemplate;
  }
}
