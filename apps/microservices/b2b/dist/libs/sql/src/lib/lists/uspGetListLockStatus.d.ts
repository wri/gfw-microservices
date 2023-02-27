export interface UspGetListLockStatusRecorset {
    lock_status?: number;
    lock_user_id?: number;
}
export interface UspGetListLockStatusParams {
    list_id: number;
}
export declare class UspGetListLockStatus {
    run(databaseName: string, { list_id }: UspGetListLockStatusParams): Promise<UspGetListLockStatusRecorset>;
}
