import { SetMetadata } from '@nestjs/common';
import { PROJECT_PERMISSIONS_KEY } from '../constants/auth.constants';

export const RequireProjectPermissions = (...permissions: string[]) =>
  SetMetadata(PROJECT_PERMISSIONS_KEY, permissions);