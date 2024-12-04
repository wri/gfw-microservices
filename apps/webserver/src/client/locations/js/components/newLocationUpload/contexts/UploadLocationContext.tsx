import React, { createContext, useState, ReactNode, useContext } from 'react';

import { useHistory } from '../hooks';
import { UploadType } from '../types';

type UploadLocationType = {
  uploadType: UploadType | null;
  selectUploadType: (uploadType: UploadType) => void;
  clearUploadType: () => void;
};

const UploadLocationContext = createContext({} as UploadLocationType);

interface UploadLocationProviderProps {
  children: ReactNode;
}

export function UploadLocationProvider({ children }: UploadLocationProviderProps) {
  const history = useHistory();
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
    history.push('OPTIONS');
  };

  return (
    <UploadLocationContext.Provider value={{ uploadType, selectUploadType, clearUploadType }}>
      {children}
    </UploadLocationContext.Provider>
  );
}

export const useUploadLocation = () => useContext(UploadLocationContext);
