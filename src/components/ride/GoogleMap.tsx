/**
 * Smart Map Component Wrapper
 * 
 * Automatically selects the correct map component based on ride status:
 * - RoutePreviewMap: For ride offers (before booking) - shows route only
 * - LiveTrackingGPS: For booked rides (after booking) - shows live tracking with progress
 */

import { RoutePreviewMap } from './RoutePreviewMap';
import { LiveTrackingGPS } from './LiveTrackingGPS';
import { User as UserType } from '../../types';

interface GoogleMapProps {
    ride: any;
    currentUser?: UserType | null;
    onClose: () => void;
    isBooked?: boolean; // Flag to indicate if ride is booked
}

export const GoogleMap = ({ ride, currentUser, onClose, isBooked = false }: GoogleMapProps) => {
    // If ride is booked, show live tracking with progress
    if (isBooked) {
        return <LiveTrackingGPS ride={ride} currentUser={currentUser} onClose={onClose} />;
    }
    
    // Otherwise, show route preview (no progress, no movement)
    return <RoutePreviewMap ride={ride} onClose={onClose} />;
};

// Export individual components for direct use if needed
export { RoutePreviewMap } from './RoutePreviewMap';
export { LiveTrackingGPS } from './LiveTrackingGPS';
export { LiveTrackingMap } from './LiveTrackingMap';
export { SimulatedMap } from './SimulatedMap';
