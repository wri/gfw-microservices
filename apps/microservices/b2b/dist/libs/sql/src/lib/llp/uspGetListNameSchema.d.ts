import { GenerationFileRequest, ListNameSchema } from './model';
export declare class UspGetListNameSchema {
    run(databaseName: string, filters: GenerationFileRequest): Promise<ListNameSchema>;
}
