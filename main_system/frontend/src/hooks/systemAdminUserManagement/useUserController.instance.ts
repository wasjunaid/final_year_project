import { systemAdminUserManagementRepository } from '../../repositories/systemAdminUserManagement';
import { createUseSystemAdminUserManagementController } from './useUserController';

export const useSystemAdminUserManagementController = createUseSystemAdminUserManagementController({ systemAdminUserManagementRepository });
