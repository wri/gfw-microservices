import { createContext, useContext, useState } from 'react';

interface ConvertersContextType {
  convertersList: Array<Record<string, any>>;
  isLoading: boolean;
  error: string | null;
  fetchConverters: () => Promise<void>;
}

const ConvertersContext = createContext<ConvertersContextType | undefined>(undefined);

export function ConvertersProvider({ isLoading, setIsLoading, children }) {
  const [convertersList, setConvertersList] = useState([]);
  const [error, setError] = useState(null);

  async function fetchConverters() {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/converter/all');
      const data = await response.json();
      console.log('Fetched converters:', data); // <--- Add this
      setConvertersList(data.converters || []);
    } catch (e) {
      setError(e.message || 'Failed to fetch converters');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ConvertersContext.Provider value={{ convertersList, isLoading, error, fetchConverters }}>
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
