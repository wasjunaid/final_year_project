import type { HospitalPanelListDto } from './dto';
import type { HospitalPanelListModel } from './model';

export const toHospitalPanelListModel = (dto: HospitalPanelListDto): HospitalPanelListModel => ({
  hospital_panel_list_id: dto.hospital_panel_list_id,
  hospital_id: dto.hospital_id,
  insurance_company_id: dto.insurance_company_id,
  hospital_name: dto.hospital_name,
  insurance_company_name: dto.insurance_company_name,
});

export const toHospitalPanelListModels = (dtos: HospitalPanelListDto[]): HospitalPanelListModel[] =>
  dtos.map(toHospitalPanelListModel);
