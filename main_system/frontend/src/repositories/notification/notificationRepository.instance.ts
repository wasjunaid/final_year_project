import { notificationService } from '../../services/notification/';
import { createNotificationRepository } from './notificationRepository';

export const notificationRepository = createNotificationRepository({ notificationService });
