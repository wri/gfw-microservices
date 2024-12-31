import React, { createContext, useContext, useReducer, ReactNode } from 'react';

import { useHistory } from '../hooks';
import { Area, Coordinate, UploadType } from '../types';

type UploadLocationState = {
  uploadType: UploadType | null;
  locationName: string;
  coordinates: Coordinate[];
  address: string;
  area: Area;
  uploadedFileUrl: string | null;
  commodity: string;
  existingListName: string | null;
  newListName: string | null;
  typeOfAnalysis: {
    post2000ForestChange: boolean;
    includePalmRiskAssessment: boolean;
    recentDeforestationAlerts: boolean;
    post2000RiskAssessment: boolean;
  };
};

type UploadLocationType = {
  selectUploadType: (uploadType: UploadType) => void;
  clearUploadType: () => void;
  uploadLocationState: UploadLocationState;
  setUploadLocationByPointCoordinates: (data: {
    locationName: string;
    coordinate: Coordinate;
    area: Area;
  }) => void;
  setUploadLocationByPointAddress: (data: {
    locationName: string;
    address: string;
    area: Area;
  }) => void;
  setUploadLocationByPolygon: (data: { locationName: string; coordinates: Coordinate[] }) => void;
  setUploadLocationConfigureList: (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    typeOfAnalysis: {
      includePalmRiskAssessment: boolean;
      post2000ForestChange: boolean;
      post2000RiskAssessment: boolean;
      recentDeforestationAlerts: boolean;
    };
  }) => void;
  addFileUrl: (uploadedFileUrl: string) => void;
};

type UploadLocationAction =
  | {
      type: 'SetUploadType';
      payload: {
        uploadType: UploadType | null;
      };
    }
  | {
      type: 'ByPointCoordinates';
      payload: {
        locationName: string;
        coordinates: Coordinate[];
        area: Area;
      };
    }
  | {
      type: 'ByPointAddress';
      payload: {
        locationName: string;
        address: string;
        area: Area;
      };
    }
  | {
      type: 'ByPolygon';
      payload: {
        locationName: string;
        coordinates: Coordinate[];
      };
    }
  | {
      type: 'ConfigureList';
      payload: {
        commodity: string;
        existingListName: string | null;
        newListName: string | null;
        typeOfAnalysis: {
          includePalmRiskAssessment: boolean;
          post2000ForestChange: boolean;
          post2000RiskAssessment: boolean;
          recentDeforestationAlerts: boolean;
        };
      };
    }
  | {
      type: 'AddFileUrl';
      payload: {
        uploadedFileUrl: string;
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
  uploadType: null,
  coordinates: [],
  locationName: '',
  address: '',
  area: { size: 0, measurementUnit: 'hectares' },
  uploadedFileUrl: null,
  commodity: '',
  existingListName: null,
  newListName: null,
  typeOfAnalysis: {
    includePalmRiskAssessment: false,
    post2000ForestChange: false,
    post2000RiskAssessment: false,
    recentDeforestationAlerts: false,
  },
};

export function UploadLocationProvider({ children }: UploadLocationProviderProps) {
  const history = useHistory();

  const [uploadLocationState, dispatch] = useReducer(
    uploadLocationReducer,
    uploadLocationInitialState
  );

  const selectUploadType = (type: UploadType) => {
    dispatch({ type: 'SetUploadType', payload: { uploadType: type } });
  };

  const clearUploadType = () => {
    dispatch({ type: 'Clear', payload: uploadLocationInitialState });
    history.push('OPTIONS');
  };

  const setUploadLocationByPointCoordinates = ({
    locationName,
    coordinate,
    area,
  }: {
    locationName: string;
    coordinate: Coordinate;
    area: Area;
  }) => {
    dispatch({
      type: 'ByPointCoordinates',
      payload: { locationName, coordinates: [coordinate], area },
    });
  };

  const setUploadLocationByPointAddress = ({
    locationName,
    address,
    area,
  }: {
    locationName: string;
    address: string;
    area: Area;
  }) => {
    dispatch({ type: 'ByPointAddress', payload: { locationName, address, area } });
  };

  const setUploadLocationByPolygon = ({
    locationName,
    coordinates,
  }: {
    locationName: string;
    coordinates: Coordinate[];
  }) => {
    dispatch({ type: 'ByPolygon', payload: { locationName, coordinates } });
  };

  const addFileUrl = (uploadedFileUrl: string) => {
    dispatch({ type: 'AddFileUrl', payload: { uploadedFileUrl } });
  };

  const setUploadLocationConfigureList = (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    typeOfAnalysis: {
      includePalmRiskAssessment: boolean;
      post2000ForestChange: boolean;
      post2000RiskAssessment: boolean;
      recentDeforestationAlerts: boolean;
    };
  }) => {
    dispatch({ type: 'ConfigureList', payload: data });
  };

  return (
    <UploadLocationContext.Provider
      value={{
        uploadLocationState,
        selectUploadType,
        clearUploadType,
        setUploadLocationByPointCoordinates,
        setUploadLocationByPointAddress,
        setUploadLocationByPolygon,
        setUploadLocationConfigureList,
        addFileUrl,
      }}
    >
      {children}
    </UploadLocationContext.Provider>
  );
}

export const useUploadLocation = (): UploadLocationType => useContext(UploadLocationContext);

function uploadLocationReducer(
  state: UploadLocationState,
  action: UploadLocationAction
): UploadLocationState {
  const { type, payload } = action;

  switch (type) {
    case 'SetUploadType':
      return { ...state, uploadType: payload.uploadType };

    case 'ByPointCoordinates':
      return {
        ...state,
        coordinates: payload.coordinates,
        area: payload.area,
        address: payload.locationName,
      };

    case 'ByPointAddress':
      return { ...state, address: payload.address, area: payload.area };

    case 'ByPolygon':
      return { ...state, coordinates: payload.coordinates };

    case 'AddFileUrl':
      return { ...state, uploadedFileUrl: payload.uploadedFileUrl };

    case 'ConfigureList':
      return {
        ...state,
        commodity: payload.commodity,
        existingListName: payload.existingListName,
        newListName: payload.newListName,
        typeOfAnalysis: payload.typeOfAnalysis,
      };

    case 'Clear':
      return payload;

    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}
