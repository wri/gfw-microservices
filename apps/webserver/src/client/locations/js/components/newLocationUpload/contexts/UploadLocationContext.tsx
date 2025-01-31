import React, { createContext, useContext, useReducer, ReactNode } from 'react';

import { useHistory } from '../hooks';
import { Area, Coordinate, UploadType } from '../types';
import { PresignedUrl } from '../utils/upload';

export type UploadLocationState = {
  uploadType: UploadType | null;
  locationName: string;
  coordinates: Coordinate[];
  area: Area;
  uploadedFile: PresignedUrl | null;
  commodity: string;
  existingListName: string | null;
  newListName: string | null;
  typeOfAnalysis: {
    FCD: boolean;
    palmRiskAssessment: boolean;
    ALERTS: boolean;
    AFI: boolean;
  };
};

type UploadLocationType = {
  selectUploadType: (uploadType: UploadType) => void;
  clearUploadType: () => void;
  uploadLocationState: UploadLocationState;
  setUploadLocationByPoint: (data: {
    locationName: string;
    coordinate: Coordinate;
    area: Area;
  }) => void;
  setUploadLocationByPolygon: (data: { locationName: string; coordinates: Coordinate[] }) => void;
  setUploadLocationConfigureList: (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    typeOfAnalysis: {
      palmRiskAssessment: boolean;
      FCD: boolean;
      AFI: boolean;
      ALERTS: boolean;
    };
  }) => void;
  addFile: (uploadedFile: PresignedUrl) => void;
};

type UploadLocationAction =
  | {
      type: 'SetUploadType';
      payload: {
        uploadType: UploadType | null;
      };
    }
  | {
      type: 'ByPoint';
      payload: {
        locationName: string;
        coordinates: Coordinate[];
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
          palmRiskAssessment: boolean;
          FCD: boolean;
          AFI: boolean;
          ALERTS: boolean;
        };
      };
    }
  | {
      type: 'AddFile';
      payload: {
        uploadedFile: PresignedUrl;
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
  area: { size: 0, measurementUnit: 'hectares' },
  uploadedFile: null,
  commodity: '',
  existingListName: null,
  newListName: null,
  typeOfAnalysis: {
    palmRiskAssessment: false,
    FCD: false,
    AFI: false,
    ALERTS: false,
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

  const setUploadLocationByPoint = ({
    locationName,
    coordinate,
    area,
  }: {
    locationName: string;
    coordinate: Coordinate;
    area: Area;
  }) => {
    dispatch({
      type: 'ByPoint',
      payload: { locationName, coordinates: [coordinate], area },
    });
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

  const addFile = (uploadedFile: PresignedUrl) => {
    dispatch({ type: 'AddFile', payload: { uploadedFile } });
  };

  const setUploadLocationConfigureList = (data: {
    commodity: string;
    existingListName: string | null;
    newListName: string | null;
    typeOfAnalysis: {
      palmRiskAssessment: boolean;
      FCD: boolean;
      AFI: boolean;
      ALERTS: boolean;
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
        setUploadLocationByPoint,
        setUploadLocationByPolygon,
        setUploadLocationConfigureList,
        addFile,
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

    case 'ByPoint':
      return {
        ...state,
        coordinates: payload.coordinates,
        area: payload.area,
        locationName: payload.locationName,
      };

    case 'ByPolygon':
      return { ...state, coordinates: payload.coordinates, locationName: payload.locationName };

    case 'AddFile':
      return { ...state, uploadedFile: payload.uploadedFile };

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
