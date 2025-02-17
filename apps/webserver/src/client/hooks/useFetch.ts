import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type ValidHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  method?: ValidHttpMethod;
}

type UseFetchResponse<T, E = unknown> = {
  data: T | undefined;
  error: E | undefined;
  isLoading: boolean;
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>;
};

export const useFetch = <T, E = unknown>(
  initialConfig?: ExtendedAxiosRequestConfig
): UseFetchResponse<T, E> => {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<E | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (config?: ExtendedAxiosRequestConfig) => {
      setIsLoading(true);
      setError(undefined);

      try {
        const response: AxiosResponse<T> = await axios({
          ...initialConfig,
          ...config,
        });

        setData(response.data);
      } catch (err: unknown) {
        setError(
          axios.isAxiosError(err) && err.response
            ? err.response.data || 'An error occurred'
            : 'An unexpected error occurred'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [initialConfig]
  );

  return { data, error, isLoading, request };
};
