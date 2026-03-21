export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  vehicle_type?: 'bike' | '4-wheeler' | 'scooter';
  profile_image?: string;
}

export interface Ride {
  id: number;
  driver_id: number;
  driver_name: string;
  driver_gender?: string;
  driver_vehicle?: string;
  driver_vehicle_description?: string;
  origin: string;
  destination: string;
  departure_time: string;
  available_seats: number;
  price_per_seat: number;
  status: 'active' | 'completed' | 'cancelled';
}

export interface Booking {
  id: number;
  ride_id: number;
  passenger_id: number;
  passenger_name?: string;
  passenger_gender?: string;
  passenger_phone?: string;
  seats_booked: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
  origin?: string;
  destination?: string;
  departure_time?: string;
}

// Re-export notification types
export type { Notification, NotificationType, NotificationPreferences } from './types/notification';
