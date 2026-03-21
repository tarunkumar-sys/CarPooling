export type NotificationType = 
  | 'booking_request'
  | 'booking_confirmed'
  | 'booking_rejected'
  | 'booking_cancelled'
  | 'departure_reminder'
  | 'ride_started'
  | 'ride_completed'
  | 'message'
  | 'general';

export interface Notification {
  id: number;
  user_id: number;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  ride_id?: number;
  booking_id?: number;
  action_url?: string;
}

export interface NotificationPreferences {
  push_enabled: boolean;
  email_enabled: boolean;
  booking_requests: boolean;
  booking_confirmations: boolean;
  departure_reminders: boolean;
  cancellations: boolean;
}
