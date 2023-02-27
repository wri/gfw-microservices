export declare class CreateInvitationDto {
    addressees: string[];
}
declare const UpdateInvitationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateInvitationDto>>;
export declare class UpdateInvitationDto extends UpdateInvitationDto_base {
}
export {};
