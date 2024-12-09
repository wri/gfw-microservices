import React, { createContext, useState, ReactNode, useContext, useReducer } from 'react';

import { useHistory } from '../hooks';
import { Area, Coordinate, UploadType } from '../types';

type UploadLocationState = {
  coordinates: Coordinate[];
  address: string;
  area: Area;
  commodity: string;
  existingListName: string | null;
  newListName: string | null;
  post2000ForestChange: boolean;
  includePalmRiskAssessment: boolean;
  recentDeforestationAlerts: boolean;
  post2000RiskAssessment: boolean;
};

type UploadLocationType = {
  uploadType: UploadType | null;
  selectUploadType: (uploadType: UploadType) => void;
  clearUploadType: () => void;
  uploadLocationState: UploadLocationState;
  setUploadLocationByPointCoordinates: (data: { coordinate: Coordinate; area: Area }) => void;
  setUploadLocationByPointAddress: (data: { address: string; area: Area }) => void;
  setUploadLocationByPolygon: (data: { coordinates: Coordinate[] }) => void;
  setUploadLocationConfigureList: (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    includePalmRiskAssessment: boolean;
    post2000ForestChange: boolean;
    post2000RiskAssessment: boolean;
    recentDeforestationAlerts: boolean;
  }) => void;
};

type UploadLocationAction =
  | {
      type: 'ByPointCoordinates';
      payload: {
        coordinate: Coordinate;
        area: Area;
      };
    }
  | {
      type: 'ByPointAddress';
      payload: {
        address: string;
        area: Area;
      };
    }
  | {
      type: 'ByPolygon';
      payload: {
        coordinates: Coordinate[];
      };
    }
  | {
      type: 'ConfigureList';
      payload: {
        commodity: string;
        existingListName: string | null;
        newListName: string | null;
        includePalmRiskAssessment: boolean;
        post2000ForestChange: boolean;
        post2000RiskAssessment: boolean;
        recentDeforestationAlerts: boolean;
      };
    }
  | {
      type: 'Clear';
      payload: UploadLocationState;
    };

const UploadLocationContext = createContext({} as UploadLocationType);

type UploadLocationProviderProps = {
  children: ReactNode;
};

const uploadLocationInitialState: UploadLocationState = {
  coordinates: [],
  address: '',
  area: { size: 0, measurementUnit: 'hectares' },
  commodity: '',
  existingListName: null,
  newListName: null,
  includePalmRiskAssessment: false,
  post2000ForestChange: false,
  post2000RiskAssessment: false,
  recentDeforestationAlerts: false,
};

export function UploadLocationProvider({ children }: UploadLocationProviderProps) {
  const history = useHistory();
  const [uploadType, setUploadType] = useState<UploadType | null>(null);

  const [uploadLocationState, dispatch] = useReducer(
    uploadLocationReducer,
    uploadLocationInitialState
  );

  const selectUploadType = (type: UploadType) => {
    setUploadType(type);
  };

  const clearUploadType = () => {
    setUploadType(null);
    dispatch({ type: 'Clear', payload: uploadLocationInitialState });
    history.push('OPTIONS');
  };

  const setUploadLocationByPointCoordinates = (data: { coordinate: Coordinate; area: Area }) => {
    dispatch({ type: 'ByPointCoordinates', payload: data });
  };

  const setUploadLocationByPointAddress = (data: { address: string; area: Area }) => {
    dispatch({ type: 'ByPointAddress', payload: data });
  };

  const setUploadLocationByPolygon = (data: { coordinates: Coordinate[] }) => {
    dispatch({ type: 'ByPolygon', payload: data });
  };

  const setUploadLocationConfigureList = (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    includePalmRiskAssessment: boolean;
    post2000ForestChange: boolean;
    post2000RiskAssessment: boolean;
    recentDeforestationAlerts: boolean;
  }) => {
    dispatch({ type: 'ConfigureList', payload: data });
  };

  return (
    <UploadLocationContext.Provider
      value={{
        uploadType,
        selectUploadType,
        clearUploadType,
        uploadLocationState,
        setUploadLocationByPointCoordinates,
        setUploadLocationByPointAddress,
        setUploadLocationByPolygon,
        setUploadLocationConfigureList,
      }}
    >
      {children}
    </UploadLocationContext.Provider>
  );
}

export const useUploadLocation = () => useContext(UploadLocationContext);

function uploadLocationReducer(
  state: UploadLocationState,
  action: UploadLocationAction
): UploadLocationState {
  const { type, payload } = action;

  switch (type) {
    case 'ByPointCoordinates':
    case 'ByPointAddress':
    case 'ByPolygon':
    case 'ConfigureList':
    case 'Clear':
      return { ...state, ...payload };

    default:
      return state;
  }
}
