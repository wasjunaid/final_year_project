export const AppointmentStatus = {
  processing: 'processing',
  denied: 'denied',
  upcoming: 'upcoming',
  in_progress: 'in progress',
  completed: 'completed',
  cancelled: 'cancelled'
} as const;

export type AppointmentStatusType = typeof AppointmentStatus[keyof typeof AppointmentStatus];
