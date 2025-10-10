export interface HospitalPannel {
  hospital_pannel_list_id: number; //primarykey
  hospital_id: number; //foreignkey
  insurance_company_id: number; //foreignkey
  created_at: Date;
  updated_at: Date;
  // TODO: add joins to get nessary the data here
}

export interface InsertHospitalPannelRequest {
  insurance_company_id: number; //foreignkey
}
