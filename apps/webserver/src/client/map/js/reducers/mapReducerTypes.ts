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
}
