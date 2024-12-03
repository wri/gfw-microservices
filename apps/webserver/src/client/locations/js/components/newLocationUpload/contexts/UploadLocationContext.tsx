import React, { createContext, useState, ReactNode, useContext } from 'react';
import { UploadType } from '../types/index';

type UploadLocationType = {
  uploadType: UploadType | null;
  selectUploadType: (uploadType: UploadType) => void;
  clearUploadType: () => void;
};

const UploadLocationContext = createContext({} as UploadLocationType);

interface UploadLocationProviderProps {
  children: ReactNode;
}

export const UploadLocationProvider = ({ children }: UploadLocationProviderProps) => {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
  };

  return (
    <UploadLocationContext.Provider value={{ uploadType, selectUploadType, clearUploadType }}>
      {children}
    </UploadLocationContext.Provider>
  );
};

export const useUploadLocation = () => useContext(UploadLocationContext);
