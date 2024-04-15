import { InjectRepository } from '@nestjs/typeorm';
import { ListTemplate } from '@wri-monorepos/sql';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ValidateCsvRepository {
  @InjectRepository(ListTemplate, 'default')
  private listTemplateRepository: Repository<ListTemplate>;
  getAllListTemplates() {
    return this.listTemplateRepository.find();
  }
}
