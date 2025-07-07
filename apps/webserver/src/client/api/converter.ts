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

export const startConverter = async (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<any>,
  converterName: string,
  organizationId: string | null
): Promise<{ converterId: string; status: string }> => {
  const response = await request({
    url: '/converter/start',
    method: 'POST',
    data: { converterName, organizationId },
  });

  return response.data;
};

export const stopConverter = (
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>,
  converterId: number
) => {
  return request({
    url: `/converter/${converterId}/stop`,
    method: 'POST',
  });
};
