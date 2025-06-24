import { ExtendedAxiosRequestConfig } from '../hooks/useFetch';

export const fetchConverters = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>
) => {
  return request({
    url: '/converter/all',
    method: 'GET',
  });
};
