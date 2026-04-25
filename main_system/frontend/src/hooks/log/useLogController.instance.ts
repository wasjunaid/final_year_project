import { logRepository } from '../../repositories/log';
import { createUseLogController } from './useLogController';

export const useLogController = createUseLogController({ logRepository });
