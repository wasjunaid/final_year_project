import { systemAdminUserManagementService } from '../../services/systemAdminUserManagement';
import { createSystemAdminUserManagementRepository } from './userRepository';

export const systemAdminUserManagementRepository = createSystemAdminUserManagementRepository({ systemAdminUserManagementService });
