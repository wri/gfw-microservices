import ResultPromise from '../../Shared/domain/result/result.promise';
import { Organization } from './organization.entity';

export abstract class OrganizationRepository {
  abstract findByFilters(filters: { [key in string]: string | boolean }): ResultPromise<Organization[] | undefined>;
  abstract findById(id: number): ResultPromise<Organization>;
}
