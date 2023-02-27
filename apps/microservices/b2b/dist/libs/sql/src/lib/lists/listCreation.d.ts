export interface CreateListResult {
    list_id: number;
}
export declare class SPSListCreation {
    createNewList(list_name: string, template_id: number, location_classification: string, user_id: number, custom_attributes: string[], clientDatabase: string, gfw_list_id?: number, saveAsDraft?: boolean): Promise<CreateListResult>;
}
