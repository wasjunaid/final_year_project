import { hospitalPanelListService } from '../../services/hospitalPanelList';
import { createHospitalPanelListRepository } from '../../repositories/hospitalPanelList';
import { createUseHospitalPanelListController } from './useHospitalPanelListController';

// Wire up dependencies
const hospitalPanelListRepository = createHospitalPanelListRepository({ hospitalPanelListService });
export const useHospitalPanelListController = createUseHospitalPanelListController({ hospitalPanelListRepository });
