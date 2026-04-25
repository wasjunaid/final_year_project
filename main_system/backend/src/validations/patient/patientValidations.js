const PATIENT_CONFIG = {
    SMOKING_MAX_LENGTH: 100,
    ALCOHOL_MAX_LENGTH: 100,
    DRUG_USE_MAX_LENGTH: 100
};

const VALID_SMOKING_STATUSES = [
    'never',
    'former',
    'occasional',
    'daily',
    'heavy'
];

const VALID_ALCOHOL_STATUSES = [
    'never',
    'former',
    'occasional',
    'regular',
    'heavy'
];

const VALID_DRUG_USE_STATUSES = [
    'never',
    'former',
    'occasional',
    'regular',
    'heavy'
];

module.exports = { PATIENT_CONFIG, VALID_SMOKING_STATUSES, VALID_ALCOHOL_STATUSES, VALID_DRUG_USE_STATUSES };