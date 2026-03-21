/**
 * Notification System Demo Component
 * Demonstrates all notification types and semantic colors
 */

import { useNotificationService } from '../../hooks/useNotificationService';
import { useToast } from '../../contexts/ToastContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { User } from '../../types';
import { Bell, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

export const NotificationDemo = ({ user }: { user: User | null }) => {
  const notificationService = useNotificationService(user);
  const { success, error, warning, info } = useToast();
  const { requestPermission, hasPermission } = useNotifications();

  const handleRequestPermission = async () => {
    const granted = await requestPermission();
    if (granted) {
      success('Push notifications enabled!');
    } else {
      warning('Push notifications blocked. Please enable in browser settings.');
    }
  };

  const demoBookingRequest = () => {
    notificationService.notifyBookingRequest({
      passengerName: 'Rahul Kumar',
      origin: 'Taj Mahal',
      destination: 'Agra Fort',
      seats: 2,
      bookingId: 101,
      rideId: 201,
    });
  };

  const demoBookingConfirmed = () => {
    notificationService.notifyBookingConfirmed({
      driverName: 'Priya Sharma',
      origin: 'Sikandra',
      destination: 'Fatehpur Sikri',
      departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      bookingId: 102,
      rideId: 202,
    });
  };

  const demoBookingRejected = () => {
    notificationService.notifyBookingRejected({
      driverName: 'Amit Singh',
      origin: 'Agra Cantt',
      destination: 'Mathura',
      bookingId: 103,
      rideId: 203,
    });
  };

  const demoCancellation = () => {
    notificationService.notifyBookingCancelled({
      origin: 'Dayal Bagh',
      destination: 'Taj Mahal',
      departureTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
      cancelledBy: 'driver',
      bookingId: 104,
      rideId: 204,
    });
  };

  const demoDepartureReminder = () => {
    notificationService.notifyDepartureReminder({
      origin: 'Agra Fort',
      destination: 'Mehtab Bagh',
      departureTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      driverName: 'Neha Verma',
      rideId: 205,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <Bell className="w-12 h-12 text-[var(--color-brand)] mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Notification System Demo
        </h1>
        <p className="text-gray-600">
          Test all notification types and semantic colors
        </p>
      </div>

      {/* Permission Status */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Push Notification Permission</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              Status: <span className={`font-semibold ${hasPermission ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}`}>
                {hasPermission ? 'Enabled' : 'Disabled'}
              </span>
            </p>
          </div>
          {!hasPermission && (
            <button onClick={handleRequestPermission} className="btn-primary">
              Enable Notifications
            </button>
          )}
        </div>
      </div>

      {/* Semantic Color Buttons */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Semantic Color System</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <button className="btn-primary">
            Brand Orange (Primary)
          </button>
          <button className="btn-success">
            Green (Success)
          </button>
          <button className="btn-warning">
            Amber (Warning)
          </button>
          <button className="btn-danger">
            Red (Danger)
          </button>
          <button className="btn-info">
            Blue (Info)
          </button>
          <button className="btn-secondary">
            Gray (Secondary)
          </button>
        </div>
      </div>

      {/* Semantic Badges */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Status Badges</h2>
        <div className="flex flex-wrap gap-2">
          <span className="badge badge-brand">New Ride</span>
          <span className="badge badge-success">Confirmed</span>
          <span className="badge badge-warning">Pending</span>
          <span className="badge badge-danger">Cancelled</span>
          <span className="badge badge-info">Information</span>
          <span className="badge badge-neutral">Neutral</span>
        </div>
      </div>

      {/* Toast Notifications */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Toast Notifications</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => success('Operation completed successfully!')}
            className="btn-success flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Success Toast
          </button>
          <button
            onClick={() => error('An error occurred. Please try again.')}
            className="btn-danger flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Error Toast
          </button>
          <button
            onClick={() => warning('This action requires confirmation.')}
            className="btn-warning flex items-center justify-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            Warning Toast
          </button>
          <button
            onClick={() => info('Here is some helpful information.')}
            className="btn-info flex items-center justify-center gap-2"
          >
            <Info className="w-4 h-4" />
            Info Toast
          </button>
        </div>
      </div>

      {/* Push Notifications */}
      <div className="card p-4 sm:p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Push Notifications</h2>
        <p className="text-sm text-gray-600 mb-4">
          Click buttons below to trigger different notification types
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={demoBookingRequest} className="btn-info">
            📬 Booking Request
          </button>
          <button onClick={demoBookingConfirmed} className="btn-success">
            ✅ Booking Confirmed
          </button>
          <button onClick={demoBookingRejected} className="btn-danger">
            ❌ Booking Rejected
          </button>
          <button onClick={demoCancellation} className="btn-danger">
            🚫 Ride Cancelled
          </button>
          <button onClick={demoDepartureReminder} className="btn-warning">
            ⏰ Departure Reminder
          </button>
        </div>
      </div>

      {/* Mobile-First Design Info */}
      <div className="card p-4 sm:p-6 bg-gradient-to-br from-[var(--color-brand-50)] to-[var(--color-info-50)]">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Mobile-First Design</h2>
        <p className="text-sm text-gray-700">
          All components are designed mobile-first with responsive breakpoints. 
          Try resizing your browser to see the adaptive layout in action!
        </p>
      </div>
    </div>
  );
};
