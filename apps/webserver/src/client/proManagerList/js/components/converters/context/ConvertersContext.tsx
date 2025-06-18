import { createContext, useContext, useState, useCallback } from 'react';

interface ConvertersContextType {
  convertersData: Array<Record<string, any>>;
  isLoading: boolean;
  error: string | null;
  fetchConverters: () => Promise<void>;
}

const ConvertersContext = createContext<ConvertersContextType | undefined>(undefined);

export function ConvertersProvider({ isLoading, setIsLoading, children }) {
  const [convertersData, setConvertersData] = useState([]);
  const [error, setError] = useState(null);

  const fetchConverters = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/converter/all');
      const data = await response.json();
      console.log('Fetched converters:', data);
      setConvertersData(data || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch converters');
    } finally {
      setIsLoading(false);
    }
  }, [setIsLoading]);

  return (
    <ConvertersContext.Provider value={{ convertersData, isLoading, error, fetchConverters }}>
      {children}
    </ConvertersContext.Provider>
  );
}

export function useConvertersContext() {
  const context = useContext(ConvertersContext);
  if (!context) {
    throw new Error('useConvertersContext must be used within ConvertersProvider');
  }
  return context;
}
