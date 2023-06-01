import ResultPromise from '../../Shared/domain/result/result.promise';
import { Organization } from './organization.entity';

export abstract class OrganizationRepository {
  abstract findByFilters(filters: any): ResultPromise<Organization[] | undefined>;
  abstract findById(id: number): ResultPromise<Organization>;
}
