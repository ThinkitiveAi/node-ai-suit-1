export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CONFIRMED = 'Confirmed',
  CHECKED_IN = 'Checked In',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
  NO_SHOW = 'No Show',
  RESCHEDULED = 'Rescheduled',
  PENDING_CONFIRMATION = 'Pending Confirmation',
  DECLINED = 'Declined',
}

export const APPOINTMENT_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  [AppointmentStatus.SCHEDULED]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.RESCHEDULED,
    AppointmentStatus.DECLINED,
  ],
  [AppointmentStatus.CONFIRMED]: [
    AppointmentStatus.CHECKED_IN,
    AppointmentStatus.CANCELLED,
    AppointmentStatus.RESCHEDULED,
  ],
  [AppointmentStatus.CHECKED_IN]: [
    AppointmentStatus.IN_PROGRESS,
    AppointmentStatus.NO_SHOW,
  ],
  [AppointmentStatus.IN_PROGRESS]: [
    AppointmentStatus.COMPLETED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.COMPLETED]: [],
  [AppointmentStatus.CANCELLED]: [],
  [AppointmentStatus.NO_SHOW]: [],
  [AppointmentStatus.RESCHEDULED]: [
    AppointmentStatus.SCHEDULED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.PENDING_CONFIRMATION]: [
    AppointmentStatus.CONFIRMED,
    AppointmentStatus.DECLINED,
    AppointmentStatus.CANCELLED,
  ],
  [AppointmentStatus.DECLINED]: [],
};

export const INITIAL_STATUSES = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.PENDING_CONFIRMATION,
];

export const FINAL_STATUSES = [
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
  AppointmentStatus.DECLINED,
]; 