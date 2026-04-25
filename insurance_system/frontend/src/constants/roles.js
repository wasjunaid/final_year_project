export const ROLES = {
  SUPER_ADMIN: 'super admin',
  INSURANCE_ADMIN: 'insurance admin',
  INSURANCE_SUB_ADMIN: 'insurance sub admin',
};

export const RELATIONSHIP_TO_HOLDER = {
  SELF: 'self',
  SPOUSE: 'spouse',
  CHILD: 'child',
  PARENT: 'parent',
};

export const CNIC_REGEX = /^\d{13}$/;
export const CNIC_HYPHENATED_REGEX = /^\d{5}-\d{7}-\d{1}$/;