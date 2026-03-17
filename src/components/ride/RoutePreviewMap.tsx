/**
 * ============================================
 * ROUTE PREVIEW MAP COMPONENT
 * ============================================
 * 
 * Production-ready map component for displaying ride routes
 * 
 * FEATURES:
 * - Real road-based routing using OSRM (Open Source Routing Machine)
 * - Auto-fit bounds to show entire route
 * - Smooth interactions without flickering
 * - Distance and duration calculation
 * - Custom 3D markers for pickup and destination
 * - Responsive design for mobile and desktop
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Map instance persists using useMap() hook
 * - Memoized coordinates to prevent recalculation
 * - Separate RoutingControl component to avoid parent re-renders
 * - Efficient cleanup on unmount
 * 
 * @component
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { X, MapPin, Navigation as NavigationIcon, Clock, Route } from 'lucide-react';
import { createPickupIcon3D, createDestinationIcon3D } from './MapIcons';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Agra city coordinates database
 * Maps location names to [latitude, longitude] coordinates
 */
const AGRA_COORDINATES: Record<string, [number, number]> = {
    'Dayalbagh': [27.2261, 78.0125],
    'St. Johns': [27.1800, 78.0100],
    'St Johns': [27.1800, 78.0100],
    'Civil Lines': [27.1800, 78.0100],
    'Taj Mahal': [27.1751, 78.0421],
    'Agra Fort': [27.1795, 78.0214],
    'Sanjay Place': [27.1983, 78.0055],
    'Sikandra': [27.2205, 77.9505],
    'ISBT Agra': [27.2155, 77.9427],
    'Bodla': [27.1900, 77.9500],
    'Shahganj': [27.1800, 77.9800],
    'Agra': [27.1767, 78.0081],
    'default': [27.1767, 78.0081]
};

/**
 * Get coordinates for a given address
 * Performs exact and partial matching against known locations
 * 
 * @param address - Location name or address
 * @returns [latitude, longitude] tuple
 */
const getCoordinates = (address: string): [number, number] => {
    if (!address) return AGRA_COORDINATES.default;
    const addressLower = address.toLowerCase().trim();
    
    // Try exact match first
    const exactMatch = Object.keys(AGRA_COORDINATES).find(k => k.toLowerCase() === addressLower);
    if (exactMatch) return AGRA_COORDINATES[exactMatch];
    
    // Try partial match
    const partialMatch = Object.keys(AGRA_COORDINATES).find(k => 
        addressLower.includes(k.toLowerCase()) || k.toLowerCase().includes(addressLower)
    );
    if (partialMatch) return AGRA_COORDINATES[partialMatch];
    
    return AGRA_COORDINATES.default;
};

interface RoutingControlProps {
    pickupCoords: [number, number];
    destinationCoords: [number, number];
    onRouteFound: (distance: number, duration: number) => void;
}

/**
 * Routing Control Component
 * 
 * Manages Leaflet Routing Machine without causing parent re-renders
 * Uses useMap() hook to access persistent map instance
 * 
 * @component
 */
function RoutingControl({ pickupCoords, destinationCoords, onRouteFound }: RoutingControlProps) {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map) return;

        // Remove existing routing control to prevent duplicates
        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        // Create custom icons for waypoints
        const pickupIcon = createPickupIcon3D();
        const destIcon = createDestinationIcon3D();

        // Create routing control with OSRM backend
        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickupCoords[0], pickupCoords[1]),
                L.latLng(destinationCoords[0], destinationCoords[1])
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving' // Can be: driving, walking, cycling
            }),
            lineOptions: {
                styles: [
                    { color: '#3b82f6', opacity: 0.8, weight: 6 }
                ],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            show: false, // Hide default instructions panel for clean UI
            addWaypoints: false, // Prevent adding waypoints by clicking
            routeWhileDragging: false, // Disable dragging waypoints
            fitSelectedRoutes: true, // Auto-fit bounds to show entire route
            showAlternatives: false,
            createMarker: function(i: number, waypoint: any, n: number) {
                const icon = i === 0 ? pickupIcon : destIcon;
                return L.marker(waypoint.latLng, {
                    icon: icon,
                    draggable: false
                });
            }
        } as any).addTo(map);

        // Listen for route calculation completion
        routingControl.on('routesfound', function(e: any) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                const distance = route.summary.totalDistance / 1000; // Convert to km
                const duration = Math.round(route.summary.totalTime / 60); // Convert to minutes
                onRouteFound(distance, duration);

                // Auto-fit bounds to show entire route with padding
                const bounds = L.latLngBounds(
                    route.coordinates.map((coord: any) => [coord.lat, coord.lng])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        });

        routingControlRef.current = routingControl;

        // Cleanup on unmount
        return () => {
            if (routingControlRef.current && map) {
                try {
                    map.removeControl(routingControlRef.current);
                } catch (e) {
                    // Control might already be removed
                }
                routingControlRef.current = null;
            }
        };
    }, [map, pickupCoords[0], pickupCoords[1], destinationCoords[0], destinationCoords[1]]);

    return null;
}

/**
 * Map Invalidator Component
 * Ensures map renders correctly after container size changes
 * 
 * @component
 */
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

interface RoutePreviewMapProps {
    ride: any;
    onClose: () => void;
}

/**
 * Route Preview Map Component
 * 
 * Displays an interactive map showing the route between pickup and destination
 * Includes distance, duration, and price information
 * 
 * @param ride - Ride object containing origin, destination, and price_per_seat
 * @param onClose - Callback function when user closes the map
 */
export const RoutePreviewMap = ({ ride, onClose }: RoutePreviewMapProps) => {
    // Memoize coordinates to prevent recalculation
    const pickupCoords = useMemo(() => getCoordinates(ride.origin), [ride.origin]);
    const destinationCoords = useMemo(() => getCoordinates(ride.destination), [ride.destination]);
    
    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    const handleRouteFound = (dist: number, dur: number) => {
        setDistance(dist);
        setDuration(dur);
        setIsLoading(false);
    };

    // Calculate center point for initial map view
    const centerPoint: [number, number] = useMemo(() => [
        (pickupCoords[0] + destinationCoords[0]) / 2,
        (pickupCoords[1] + destinationCoords[1]) / 2
    ], [pickupCoords, destinationCoords]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[100] bg-black/50 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="absolute inset-2 sm:inset-4 md:inset-6 lg:inset-8 bg-white rounded-xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[calc(100vh-5rem)] sm:max-h-[calc(100vh-6rem)] md:max-h-[calc(100vh-8rem)]"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-white z-10 flex-shrink-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                        <div className="bg-blue-100 p-2 sm:p-2.5 rounded-lg sm:rounded-xl flex-shrink-0">
                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-base sm:text-lg truncate">Route Preview</h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {ride.origin} → {ride.destination}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-gray-100" style={{ minHeight: '250px' }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000] pointer-events-none">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-medium text-gray-600">Calculating optimal route...</p>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={centerPoint}
                        zoom={12}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        dragging={true}
                        touchZoom={true}
                        doubleClickZoom={true}
                        boxZoom={true}
                        keyboard={true}
                        attributionControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            maxZoom={19}
                        />

                        <MapInvalidator />
                        
                        <RoutingControl
                            pickupCoords={pickupCoords}
                            destinationCoords={destinationCoords}
                            onRouteFound={handleRouteFound}
                        />
                    </MapContainer>

                    {/* Route Info Card - Uber/Zomato Style */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-5 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                <Route className="w-4 h-4 text-blue-600" />
                                Route Information
                            </h4>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <NavigationIcon className="w-4 h-4" />
                                        Distance
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {distance > 0 ? `${distance.toFixed(1)} km` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Est. Duration
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {duration > 0 ? `${duration} min` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                    <span className="text-sm text-gray-600 font-medium">Price per Seat</span>
                                    <span className="text-xl font-bold text-blue-600">₹{ride.price_per_seat}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
