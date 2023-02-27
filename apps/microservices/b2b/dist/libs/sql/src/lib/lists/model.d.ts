export interface ListLocationsRequest {
    listID: number;
    locationID: number;
    rowsRequested: number;
}
export interface ListColumnsByIDRequest {
    listId: number;
}
export interface CopyLocationRequest {
    desListId: number;
    destLocationId: number;
    srcListId: number;
    srcLocationId: number;
    statement: string;
}
