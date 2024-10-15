import React, { useState, createContext, useContext, ReactNode } from 'react';

export enum UploadType {
  BY_FILE,
  BY_POINT,
  BY_POLYGON,
}

type UploadTypeContextType = {
  uploadType: UploadType | null;
  selectUploadType: (type: UploadType) => void;
  clearUploadType: () => void;
};

const UploadTypeContext = createContext({} as UploadTypeContextType);

export const UploadTypeProvider = ({ children }: { children: ReactNode }) => {
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
  };

  return (
    <UploadTypeContext.Provider value={{ uploadType, selectUploadType, clearUploadType }}>
      {children}
    </UploadTypeContext.Provider>
  );
};

export const useUploadType = () => useContext(UploadTypeContext);
