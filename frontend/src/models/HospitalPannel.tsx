export interface HospitalPannel {
  hospital_pannel_list_id: String; //primarykey
  hospital_id: String; //foreignkey
  insurance_company_id: String; //foreignkey
  created_at: Date;
  updated_at: Date;
  // TODO: add joins to get nessary the data here
}

export interface InsertHospitalPannelRequest {
  insurance_company_id: String; //foreignkey
}
