export enum RoleEnum {
    SUPER = "SUPER",
    COMPLIANCE = "COMPLIANCE",
    DEVELOPER = "DEVELOPER",
}

export interface MenuItemDto {
    id: number;
    title: string;
    icon: string | null;
    href: string | null;
    parentId: number | null;
    displayOrder: number;
    roles: RoleEnum[];
    allowedUserIds: number[];
    isActive: boolean;
    children?: MenuItemDto[];
}
