export declare class ConnectionMembersDto {
    memeberName: string;
    listId: string;
}
export declare class CreateConnectionDto {
    connectionName: string;
    connectionList: ConnectionMembersDto[];
}
declare const UpdateConnectionDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateConnectionDto>>;
export declare class UpdateConnectionDto extends UpdateConnectionDto_base {
}
export {};
