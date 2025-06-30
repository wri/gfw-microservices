import { ExtendedAxiosRequestConfig } from '../hooks/useFetch';

export const fetchConverters = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>
) => {
  return request({
    url: '/converter/all',
    method: 'GET',
  });
};

export const fetchConverterInfo = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>,
  converterId: number
) => {
  return request({
    url: `/converter/${converterId}/info`,
    method: 'GET',
  });
};
