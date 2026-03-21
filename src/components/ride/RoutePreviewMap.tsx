/**
 * ============================================
 * ROUTE PREVIEW MAP - UBER/OLA STYLE
 * ============================================
 * 
 * Professional map with instant loading and OSRM routing
 * 
 * FEATURES:
 * - Instant display with fallback calculation
 * - OSRM routing in background (like Uber/Ola)
 * - Zero flickering or reloading
 * - Smooth professional experience
 * - Fast response even for far distances
 * 
 * @component
 */

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, useMap, Polyline, Marker } from 'react-leaflet';
import L from 'leaflet';
import { X, MapPin, Navigation as NavigationIcon, Clock, Route, AlertCircle } from 'lucide-react';
import { createPickupIcon3D, createDestinationIcon3D } from './MapIcons';

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Geocode location name to coordinates using Nominatim API
 * Supports worldwide locations with no restrictions
 */
async function geocodeLocation(locationName: string): Promise<[number, number] | null> {
    try {
        const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(locationName)}&limit=1`,
            { signal: AbortSignal.timeout(5000) }
        );
        if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
                return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
            }
        }
    } catch (e) {
        console.warn('Geocoding failed for:', locationName, e);
    }
    return null;
}

interface RouteData {
    distance: number;
    duration: number;
    coordinates: [number, number][];
}

interface RoutingControlProps {
    pickupCoords: [number, number];
    destinationCoords: [number, number];
    onRouteFound: (data: RouteData) => void;
}

/**
 * Uber/Ola Style Routing - Instant Display + Background OSRM
 */
function RoutingControl({ pickupCoords, destinationCoords, onRouteFound }: RoutingControlProps) {
    const map = useMap();
    const hasInitialized = useRef(false);
    const onRouteFoundRef = useRef(onRouteFound);

    useEffect(() => {
        onRouteFoundRef.current = onRouteFound;
    }, [onRouteFound]);

    useEffect(() => {
        if (!map || hasInitialized.current) return;
        hasInitialized.current = true;

        // INSTANT FALLBACK - Calculate straight-line immediately (like Uber)
        const straightDistance = map.distance(
            [pickupCoords[0], pickupCoords[1]], 
            [destinationCoords[0], destinationCoords[1]]
        ) / 1000;
        const estimatedDuration = Math.round(straightDistance * 2.5);
        
        // Provide instant result
        onRouteFoundRef.current({
            distance: straightDistance,
            duration: estimatedDuration,
            coordinates: [pickupCoords, destinationCoords]
        });

        // Fit bounds immediately
        const bounds = L.latLngBounds([pickupCoords, destinationCoords]);
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });

        // BACKGROUND OSRM - Fetch real route silently (like Uber)
        const fetchOSRMRoute = async () => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
                
                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`,
                    { signal: controller.signal }
                );
                
                clearTimeout(timeoutId);
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.routes && data.routes.length > 0) {
                        const route = data.routes[0];
                        const osrmCoords = route.geometry.coordinates.map(
                            (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                        );
                        
                        // Update with real OSRM data
                        onRouteFoundRef.current({
                            distance: route.distance / 1000,
                            duration: Math.round(route.duration / 60),
                            coordinates: osrmCoords
                        });
                    }
                }
            } catch (e) {
                // Silent failure - fallback already provided
            }
        };

        // Start OSRM in background
        fetchOSRMRoute();

        return () => {
            hasInitialized.current = false;
        };
    }, [map, pickupCoords, destinationCoords]);

    return null;
}

/**
 * Map Invalidator - Ensures proper rendering
 */
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => map.invalidateSize(), 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

interface RoutePreviewMapProps {
    ride: any;
    onClose: () => void;
}

/**
 * Route Preview Map Component - Uber/Ola Style
 */
export const RoutePreviewMap = ({ ride, onClose }: RoutePreviewMapProps) => {
    const [pickupCoords, setPickupCoords] = useState<[number, number] | null>(null);
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [routeData, setRouteData] = useState<RouteData>({
        distance: 0,
        duration: 0,
        coordinates: []
    });
    
    /**
     * Get coordinates from ride data
     * Priority: 1) Stored lat/lng, 2) Geocode location name
     */
    useEffect(() => {
        const getCoordinates = async () => {
            setLoading(true);
            setError('');
            
            let pickup: [number, number] | null = null;
            let destination: [number, number] | null = null;
            
            // Try to use stored coordinates first
            if (ride.origin_lat && ride.origin_lng) {
                pickup = [ride.origin_lat, ride.origin_lng];
            } else {
                pickup = await geocodeLocation(ride.origin);
            }
            
            if (ride.dest_lat && ride.dest_lng) {
                destination = [ride.dest_lat, ride.dest_lng];
            } else {
                destination = await geocodeLocation(ride.destination);
            }
            
            if (!pickup || !destination) {
                setError('Unable to locate pickup or destination. Please try again.');
                setLoading(false);
                return;
            }
            
            setPickupCoords(pickup);
            setDestinationCoords(destination);
            setLoading(false);
        };
        
        getCoordinates();
    }, [ride]);

    // Stable callback
    const handleRouteFound = useCallback((data: RouteData) => {
        setRouteData(data);
    }, []);

    // Calculate center point
    const centerPoint: [number, number] | null = useMemo(() => {
        if (!pickupCoords || !destinationCoords) return null;
        return [
            (pickupCoords[0] + destinationCoords[0]) / 2,
            (pickupCoords[1] + destinationCoords[1]) / 2
        ];
    }, [pickupCoords, destinationCoords]);

    // Stable map key
    const mapKey = useMemo(() => 
        `map-${ride.id || 'preview'}-${ride.origin}-${ride.destination}`,
        [ride.id, ride.origin, ride.destination]
    );

    // Memoize icons
    const pickupIcon = useMemo(() => createPickupIcon3D(), []);
    const destIcon = useMemo(() => createDestinationIcon3D(), []);
    
    // Show error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-2xl p-8 max-w-md w-full text-center"
                >
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Unable to Load Route</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button onClick={onClose} className="btn-primary w-full">
                        Close
                    </button>
                </motion.div>
            </motion.div>
        );
    }
    
    // Show loading state while geocoding
    if (loading || !pickupCoords || !destinationCoords || !centerPoint) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center"
            >
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-gray-600 font-bold text-sm">Loading location data...</p>
                </div>
            </motion.div>
        );
    }

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
                    <MapContainer
                        key={mapKey}
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

                        {/* Markers */}
                        <Marker position={pickupCoords} icon={pickupIcon} />
                        <Marker position={destinationCoords} icon={destIcon} />

                        {/* Route Line */}
                        {routeData.coordinates.length > 0 && (
                            <Polyline
                                positions={routeData.coordinates}
                                color="#3b82f6"
                                weight={6}
                                opacity={0.8}
                                lineCap="round"
                                lineJoin="round"
                            />
                        )}
                    </MapContainer>

                    {/* Route Info Card */}
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
                                        {routeData.distance > 0 ? `${routeData.distance.toFixed(1)} km` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Est. Duration
                                    </span>
                                    <span className="text-sm font-bold text-gray-900">
                                        {routeData.duration > 0 ? `${routeData.duration} min` : 'Calculating...'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <span className="text-sm text-blue-700 font-semibold">Price per Seat</span>
                                    <span className="text-xl font-bold text-blue-600">₹{ride.price_per_seat || 'N/A'}</span>
                                </div>
                                {routeData.distance > 0 && ride.price_per_seat && (
                                    <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg border border-green-200">
                                        <span className="text-xs text-green-700 font-medium">Cost per km</span>
                                        <span className="text-sm font-bold text-green-600">
                                            ₹{(ride.price_per_seat / routeData.distance).toFixed(1)}/km
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
