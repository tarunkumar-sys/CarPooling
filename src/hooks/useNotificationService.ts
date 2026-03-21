import { useEffect, useCallback } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { User } from '../types';

/**
 * Hook to manage automatic notifications for booking lifecycle events
 * Triggers notifications for:
 * - Booking requests
 * - Booking confirmations
 * - Booking rejections/cancellations
 * - 30-minute departure reminders
 */
export const useNotificationService = (user: User | null) => {
  const { addNotification, requestPermission, hasPermission } = useNotifications();

  // Request notification permission on mount if user is logged in
  useEffect(() => {
    if (user && !hasPermission) {
      requestPermission();
    }
  }, [user, hasPermission, requestPermission]);

  // Send booking request notification
  const notifyBookingRequest = useCallback((rideDetails: {
    passengerName: string;
    origin: string;
    destination: string;
    seats: number;
    bookingId: number;
    rideId: number;
  }) => {
    addNotification({
      user_id: user?.id || 0,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `${rideDetails.passengerName} wants to book ${rideDetails.seats} seat(s) from ${rideDetails.origin} to ${rideDetails.destination}`,
      booking_id: rideDetails.bookingId,
      ride_id: rideDetails.rideId,
      action_url: '/my-rides',
    });
  }, [addNotification, user]);

  // Send booking confirmation notification
  const notifyBookingConfirmed = useCallback((rideDetails: {
    driverName: string;
    origin: string;
    destination: string;
    departureTime: string;
    bookingId: number;
    rideId: number;
  }) => {
    addNotification({
      user_id: user?.id || 0,
      type: 'booking_confirmed',
      title: 'Booking Confirmed! ✅',
      message: `Your ride with ${rideDetails.driverName} from ${rideDetails.origin} to ${rideDetails.destination} is confirmed for ${new Date(rideDetails.departureTime).toLocaleString()}`,
      booking_id: rideDetails.bookingId,
      ride_id: rideDetails.rideId,
      action_url: '/my-bookings',
    });
  }, [addNotification, user]);

  // Send booking rejection notification
  const notifyBookingRejected = useCallback((rideDetails: {
    driverName: string;
    origin: string;
    destination: string;
    bookingId: number;
    rideId: number;
  }) => {
    addNotification({
      user_id: user?.id || 0,
      type: 'booking_rejected',
      title: 'Booking Not Accepted',
      message: `Your booking request with ${rideDetails.driverName} from ${rideDetails.origin} to ${rideDetails.destination} was not accepted`,
      booking_id: rideDetails.bookingId,
      ride_id: rideDetails.rideId,
      action_url: '/search',
    });
  }, [addNotification, user]);

  // Send booking cancellation notification
  const notifyBookingCancelled = useCallback((rideDetails: {
    origin: string;
    destination: string;
    departureTime: string;
    cancelledBy: 'driver' | 'passenger';
    bookingId: number;
    rideId: number;
  }) => {
    const message = rideDetails.cancelledBy === 'driver'
      ? `The ride from ${rideDetails.origin} to ${rideDetails.destination} scheduled for ${new Date(rideDetails.departureTime).toLocaleString()} has been cancelled by the driver`
      : `Your booking from ${rideDetails.origin} to ${rideDetails.destination} has been cancelled`;

    addNotification({
      user_id: user?.id || 0,
      type: 'booking_cancelled',
      title: 'Ride Cancelled',
      message,
      booking_id: rideDetails.bookingId,
      ride_id: rideDetails.rideId,
      action_url: rideDetails.cancelledBy === 'driver' ? '/search' : '/my-bookings',
    });
  }, [addNotification, user]);

  // Send 30-minute departure reminder
  const notifyDepartureReminder = useCallback((rideDetails: {
    origin: string;
    destination: string;
    departureTime: string;
    driverName?: string;
    rideId: number;
  }) => {
    const message = rideDetails.driverName
      ? `Your ride with ${rideDetails.driverName} from ${rideDetails.origin} to ${rideDetails.destination} departs in 30 minutes!`
      : `Your ride from ${rideDetails.origin} to ${rideDetails.destination} departs in 30 minutes!`;

    addNotification({
      user_id: user?.id || 0,
      type: 'departure_reminder',
      title: '⏰ Departure Reminder',
      message,
      ride_id: rideDetails.rideId,
      action_url: '/my-bookings',
    });
  }, [addNotification, user]);

  // Send ride started notification
  const notifyRideStarted = useCallback((rideDetails: {
    origin: string;
    destination: string;
    rideId: number;
  }) => {
    addNotification({
      user_id: user?.id || 0,
      type: 'ride_started',
      title: 'Ride Started',
      message: `Your ride from ${rideDetails.origin} to ${rideDetails.destination} has started`,
      ride_id: rideDetails.rideId,
      action_url: '/my-bookings',
    });
  }, [addNotification, user]);

  // Send ride completed notification
  const notifyRideCompleted = useCallback((rideDetails: {
    origin: string;
    destination: string;
    rideId: number;
  }) => {
    addNotification({
      user_id: user?.id || 0,
      type: 'ride_completed',
      title: 'Ride Completed',
      message: `Your ride from ${rideDetails.origin} to ${rideDetails.destination} is complete. Please rate your experience!`,
      ride_id: rideDetails.rideId,
      action_url: '/my-bookings',
    });
  }, [addNotification, user]);

  return {
    notifyBookingRequest,
    notifyBookingConfirmed,
    notifyBookingRejected,
    notifyBookingCancelled,
    notifyDepartureReminder,
    notifyRideStarted,
    notifyRideCompleted,
  };
};
