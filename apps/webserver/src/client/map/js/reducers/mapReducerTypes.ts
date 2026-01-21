export interface MapReducerRootState {
  driverOfDisturbanceAlertsFilter: {
    startDate: string;
    endDate: string;
  };
  visibleLayers: string[];
  globalVegetationDisturbanceAlertsFilter: {
    startDate: string;
    endDate: string;
    vegetationType: string;
  };
  globalIntegratedDisturbanceAlertsFilter: {
    startDate: string;
    endDate: string;
    onlyHighConfidenceAlerts: boolean;
    vegetationType: string;
  };
  prodesDeforestationFilter: {
    startYear: number;
    endYear: number;
  };
}
