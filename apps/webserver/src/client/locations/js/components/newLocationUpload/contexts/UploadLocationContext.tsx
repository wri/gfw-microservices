import React, { createContext, useState, ReactNode, useContext } from 'react';

import { useHistory } from '../hooks';
import { LocationListType, UploadType } from '../types';

type UploadLocationType = {
  uploadType: UploadType | null;
  selectUploadType: (uploadType: UploadType) => void;
  selectUploadLocationsList: (uploadList: LocationListType[]) => void;
  clearUploadType: () => void;
  uploadLocationsList: LocationListType[] | null;
};

const UploadLocationContext = createContext({} as UploadLocationType);

interface UploadLocationProviderProps {
  children: ReactNode;
}

export function UploadLocationProvider({ children }: UploadLocationProviderProps) {
  const history = useHistory();
  const [uploadType, setUploadType] = useState<UploadType | null>(null);
  const [uploadLocationsList, setUploadLocationsList] = useState<LocationListType[] | null>(null);

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const selectUploadLocationsList = (uploadList: LocationListType[]) => {
    setUploadLocationsList(uploadList);
  };

  const clearUploadType = () => {
    setUploadType(null);
    history.push('OPTIONS');
  };

  return (
    <UploadLocationContext.Provider
      value={{
        uploadType,
        selectUploadType,
        clearUploadType,
        uploadLocationsList,
        selectUploadLocationsList,
      }}
    >
      {children}
    </UploadLocationContext.Provider>
  );
}

export const useUploadLocation = () => useContext(UploadLocationContext);
