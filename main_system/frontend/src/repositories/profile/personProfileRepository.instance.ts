import { personProfileService } from '../../services/profile';
import { createPersonProfileRepository } from './personProfileRepository';

export const personProfileRepository = createPersonProfileRepository({ profileService: personProfileService });

// Profiles which do not have specialized data can use personProfileRepository directly

// Roles without specialized data are:
// - System Admin
// - Frontdesk Staff
// - Medical Coder
// - Hospital admin
// - Lab Technician