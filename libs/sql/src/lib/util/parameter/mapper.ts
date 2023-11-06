import { ParameterType } from '../types';
import { InputDataType, parameters } from './values';

export const toSqlParameter = (json: InputDataType): Array<ParameterType> => {
  if (!json) return [];

  return Object?.entries(json).reduce((acc, [key, value]) => {
    if (Object.prototype.hasOwnProperty.call(parameters, key)) {
      return [...acc, { ...parameters[key], value }];
    }
    return acc;
  }, []);
};
