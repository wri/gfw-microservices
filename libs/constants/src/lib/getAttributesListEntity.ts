import { EntityTarget } from 'typeorm';
import {
  ListAdministrativeAreas,
  ListOilPalmConcessions,
  ListProtectedAreas,
  ListsPalmOilMills,
  RspoOilPalmConcessions,
} from '../entity';

export function getAttributesListEntity(
  list_id: number
): EntityTarget<
  | ListOilPalmConcessions
  | ListsPalmOilMills
  | RspoOilPalmConcessions
  | ListAdministrativeAreas
  | ListProtectedAreas
> {
  const ATTRIBUTES_LIST_TABLE = ListsPalmOilMills;
  const ATTRIBUTES_LIST_TABLE_NAMES = {
    1: ListAdministrativeAreas,
    2: ListOilPalmConcessions,
    3: ListsPalmOilMills,
    4: ListProtectedAreas,
    5: RspoOilPalmConcessions,
  };
  return ATTRIBUTES_LIST_TABLE_NAMES[list_id] || ATTRIBUTES_LIST_TABLE;
}
