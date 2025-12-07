import { logService } from '../../services/log';
import { createLogRepository } from './logRepository';

export const logRepository = createLogRepository({ logService });
