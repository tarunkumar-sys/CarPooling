/**
 * Notification Scheduler
 * Manages scheduled notifications like departure reminders
 */

interface ScheduledNotification {
  id: string;
  rideId: number;
  departureTime: string;
  timeoutId: number;
}

class NotificationScheduler {
  private scheduledNotifications: Map<string, ScheduledNotification> = new Map();

  /**
   * Schedule a 30-minute departure reminder
   */
  scheduleDepartureReminder(
    rideId: number,
    departureTime: string,
    callback: () => void
  ): string {
    const departureDate = new Date(departureTime);
    const reminderTime = new Date(departureDate.getTime() - 30 * 60 * 1000); // 30 minutes before
    const now = new Date();
    const delay = reminderTime.getTime() - now.getTime();

    const id = `reminder-${rideId}-${Date.now()}`;

    // Only schedule if the reminder time is in the future
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        callback();
        this.scheduledNotifications.delete(id);
      }, delay);

      this.scheduledNotifications.set(id, {
        id,
        rideId,
        departureTime,
        timeoutId,
      });

      console.log(`Scheduled departure reminder for ride ${rideId} at ${reminderTime.toLocaleString()}`);
      return id;
    }

    return '';
  }

  /**
   * Cancel a scheduled notification
   */
  cancelNotification(id: string): boolean {
    const notification = this.scheduledNotifications.get(id);
    if (notification) {
      clearTimeout(notification.timeoutId);
      this.scheduledNotifications.delete(id);
      return true;
    }
    return false;
  }

  /**
   * Cancel all notifications for a specific ride
   */
  cancelRideNotifications(rideId: number): void {
    const toDelete: string[] = [];
    this.scheduledNotifications.forEach((notification, id) => {
      if (notification.rideId === rideId) {
        clearTimeout(notification.timeoutId);
        toDelete.push(id);
      }
    });
    toDelete.forEach(id => this.scheduledNotifications.delete(id));
  }

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications(): ScheduledNotification[] {
    return Array.from(this.scheduledNotifications.values());
  }

  /**
   * Clear all scheduled notifications
   */
  clearAll(): void {
    this.scheduledNotifications.forEach(notification => {
      clearTimeout(notification.timeoutId);
    });
    this.scheduledNotifications.clear();
  }
}

// Export singleton instance
export const notificationScheduler = new NotificationScheduler();
