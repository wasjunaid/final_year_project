import { ROLES, type UserRole } from "../../../constants/roles";
import ROUTES from "../../../constants/routes";

interface IRolePortalNavigationProps {
  role: UserRole;
}

const rolePortalRoute = ({ role }: IRolePortalNavigationProps) => {
  switch (role) {
    case ROLES.ADMIN:
    case ROLES.SUPER_ADMIN:
      return ROUTES.ADMIN_PORTAL;

    case ROLES.PATIENT:
      return ROUTES.PATIENT_PORTAL;

    case ROLES.DOCTOR:
      return ROUTES.DOCTOR_PORTAL;

    case ROLES.HOSPITAL_ADMIN:
    case ROLES.HOSPITAL_SUB_ADMIN:
      return ROUTES.HOSPITAL_PORTAL;

    case ROLES.HOSPITAL_FRONT_DESK:
      return ROUTES.FRONT_DESK_PORTAL;

    case ROLES.HOSPITAL_LAB_TECHNICIAN:
      return ROUTES.LAB_TECHNICIAN_PORTAL;
        
    case ROLES.MEDICAL_CODER:
      return ROUTES.MEDICAL_CODER_PORTAL;

    default:
      return null;
  }
};

export default rolePortalRoute;
