import { useState, useCallback } from 'react';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

type ValidHttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  method?: ValidHttpMethod;
}

type UseFetchResponse<T> = {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  request: (config?: ExtendedAxiosRequestConfig) => Promise<void>;
};

export const useFetch = <T>(initialConfig?: ExtendedAxiosRequestConfig): UseFetchResponse<T> => {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
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
            ? err.response.data.message || 'An error occurred'
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
