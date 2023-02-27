import { CopyLocationRequest } from './model';
export declare class UspCopyLocationAnalysis {
    run(databaseName: string, { desListId, destLocationId, srcListId, srcLocationId, statement, }: CopyLocationRequest): Promise<void>;
}
