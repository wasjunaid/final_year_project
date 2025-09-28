export interface PersonModel {
    person_id: number;
    email: string;
    // password_hash: string;
    first_name: string;
    last_name: string;
    cnic: string;
    date_of_birth: Date;
    gender: string;
    blood_group: string;
    address_id: number;
    is_verified: boolean;
}