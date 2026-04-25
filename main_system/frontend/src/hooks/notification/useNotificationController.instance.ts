import { notificationRepository } from '../../repositories/notification';
import { createNotificationController } from './useNotificationController';

export const useNotificationController = createNotificationController({ repository: notificationRepository });
