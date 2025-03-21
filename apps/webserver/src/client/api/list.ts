import { ExtendedAxiosRequestConfig } from '../hooks/useFetch';

export const fetchListsByCommodity = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>,
  selectedCommodity: string
) => {
  return request({
    method: 'GET',
    url: `/api/list/by-commodity?commodity=${selectedCommodity.toLowerCase()}`,
  });
};

export const fetchListPreview = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>,
  keyFile: string
) => {
  request({
    method: 'GET',
    url: '/api/list/preview',
    params: {
      path: keyFile,
    },
  });
};
