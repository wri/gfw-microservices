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
  existingList: { id: number; name: string } | null;
  newListName: string | null;
  typeOfAnalysis: {
    FCD: boolean;
    palmRiskAssessment: boolean;
    ALERTS: boolean;
    AFI: boolean;
  };
  isDraft?: boolean;
};

type UploadLocationType = {
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
    existingList: { id: number; name: string } | null;
    newListName: string | null;
    typeOfAnalysis: {
      palmRiskAssessment: boolean;
      FCD: boolean;
      AFI: boolean;
      ALERTS: boolean;
    };
  }) => void;
  addFile: (uploadedFile: PresignedUrl) => void;
  updateSaveMode: (isDraft: boolean) => void;
};

type UploadLocationAction =
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
        existingList: { id: number; name: string } | null;
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
      type: 'UpdateSaveMode';
      payload: {
        isDraft: boolean;
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
  existingList: null,
  newListName: null,
  typeOfAnalysis: {
    palmRiskAssessment: false,
    FCD: false,
    AFI: false,
    ALERTS: false,
  },
  isDraft: undefined,
};

export function UploadLocationProvider({ children }: UploadLocationProviderProps) {
  const history = useHistory();

  const [uploadLocationState, dispatch] = useReducer(
    uploadLocationReducer,
    uploadLocationInitialState
  );

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

  const updateSaveMode = (isDraft: boolean) => {
    dispatch({ type: 'UpdateSaveMode', payload: { isDraft } });
  };

  const setUploadLocationConfigureList = (data: {
    commodity: string;
    existingList: { id: number; name: string } | null;
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
        clearUploadType,
        setUploadLocationByPoint,
        setUploadLocationByPolygon,
        setUploadLocationConfigureList,
        addFile,
        updateSaveMode,
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
    case 'ByPoint':
      return {
        ...state,
        coordinates: payload.coordinates,
        area: payload.area,
        locationName: payload.locationName,
        uploadType: UploadType.ByPoint,
      };

    case 'ByPolygon':
      return {
        ...state,
        coordinates: payload.coordinates,
        locationName: payload.locationName,
        uploadType: UploadType.ByPolygon,
      };

    case 'AddFile':
      return { ...state, uploadedFile: payload.uploadedFile, uploadType: UploadType.ByFile };

    case 'ConfigureList':
      return {
        ...state,
        commodity: payload.commodity,
        existingList: payload.existingList,
        newListName: payload.newListName,
        typeOfAnalysis: payload.typeOfAnalysis,
      };

    case 'UpdateSaveMode':
      return { ...state, isDraft: payload.isDraft };

    case 'Clear':
      return payload;

    default:
      throw new Error(`Unhandled action type: ${type}`);
  }
}
