import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type ValidHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  method?: ValidHttpMethod;
}

type UseFetchResponse<T, E = unknown> = {
  data: T | null;
  error: E | null;
  isLoading: boolean;
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>;
};

export const useFetch = <T, E>(
  initialConfig?: ExtendedAxiosRequestConfig
): UseFetchResponse<T, E> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<E | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const request = useCallback(
    async (config?: ExtendedAxiosRequestConfig) => {
      setIsLoading(true);
      setError(null);

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
