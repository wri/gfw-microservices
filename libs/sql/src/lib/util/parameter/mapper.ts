import { ParameterType } from '../types';
import { parameters } from './values';

export const toSqlParameter = (json: unknown): Array<ParameterType> => {
  if (!json) return [];

  return Object?.entries(json).reduce((acc, [key, value]) => {
    if (Object.prototype.hasOwnProperty.call(parameters, key)) {
      return [...acc, { ...parameters[key], value }];
    }
    return acc;
  }, []);
};
