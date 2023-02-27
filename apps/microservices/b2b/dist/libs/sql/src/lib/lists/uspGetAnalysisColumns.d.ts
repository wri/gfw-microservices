import { ListColumnsByIDRequest } from './model';
export declare class UspGetAnalysisColumns {
    run(databaseName: string, { listId }: ListColumnsByIDRequest): Promise<unknown[]>;
}
