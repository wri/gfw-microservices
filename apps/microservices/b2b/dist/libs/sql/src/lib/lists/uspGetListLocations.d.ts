import { ListLocationsRequest } from './model';
export declare class UspGetListLocations {
    run(databaseName: string, { listID, locationID, rowsRequested }: ListLocationsRequest): Promise<unknown[]>;
}
