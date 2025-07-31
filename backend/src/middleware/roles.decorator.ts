import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
export const USER_TYPES_KEY = 'userTypes';

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const UserTypes = (...types: string[]) => SetMetadata(USER_TYPES_KEY, types);
