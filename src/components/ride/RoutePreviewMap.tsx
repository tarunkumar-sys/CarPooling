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
 */
const AGRA_COORDINATES: Record<string, [number, number]> = {
    'Dayalbagh': [27.226100, 78.012500],
    'St. Johns': [27.180000, 78.010000],
    'St Johns': [27.180000, 78.010000],
    'Civil Lines': [27.180000, 78.010000],
    'Taj Mahal': [27.175100, 78.042100],
    'Agra Fort': [27.179500, 78.021400],
    'Sanjay Place': [27.198300, 78.005500],
    'Sikandra': [27.220500, 77.950500],
    'ISBT Agra': [27.215500, 77.942700],
    'Bodla': [27.190000, 77.950000],
    'Shahganj': [27.180000, 77.980000],
    'Raja Ki Mandi': [27.196100, 77.995500],
    'Sadar Bazaar': [27.161100, 78.011100],
    'Fatehabad Road': [27.160000, 78.040000],
    'Kamla Nagar': [27.210000, 78.020000],
    'Water Works': [27.205000, 78.030000],
    'Bhagwan Talkies': [27.200000, 78.010000],
    'Khandari': [27.205000, 78.005000],
    'Rambagh': [27.211100, 78.024700],
    'Ram Bagh': [27.211100, 78.024700],
    'Ramabagh': [27.211100, 78.024700],
    'Belanganj': [27.190000, 78.005000],
    'Lohamandi': [27.185000, 78.000000],
    'Pratap Pura': [27.195000, 78.015000],
    'Nunhai': [27.210000, 78.035000],
    'Tajganj': [27.170000, 78.045000],
    'Rakabganj': [27.175000, 78.025000],
    'Agra': [27.176700, 78.008100],
    'default': [27.176700, 78.008100]
};

const getCoordinates = (address: string): [number, number] => {
    if (!address) return AGRA_COORDINATES.default;
    const addressLower = address.toLowerCase().trim();
    
    const exactMatch = Object.keys(AGRA_COORDINATES).find(k => k.toLowerCase() === addressLower);
    if (exactMatch) return AGRA_COORDINATES[exactMatch];
    
    const partialMatch = Object.keys(AGRA_COORDINATES).find(k => 
        addressLower.includes(k.toLowerCase()) || k.toLowerCase().includes(addressLower)
    );
    if (partialMatch) return AGRA_COORDINATES[partialMatch];
    
    return AGRA_COORDINATES.default;
};

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
    // Memoize coordinates
    const pickupCoords = useMemo(() => getCoordinates(ride.origin), [ride.origin]);
    const destinationCoords = useMemo(() => getCoordinates(ride.destination), [ride.destination]);
    
    const [routeData, setRouteData] = useState<RouteData>({
        distance: 0,
        duration: 0,
        coordinates: []
    });

    // Stable callback
    const handleRouteFound = useCallback((data: RouteData) => {
        setRouteData(data);
    }, []);

    // Calculate center point
    const centerPoint: [number, number] = useMemo(() => [
        (pickupCoords[0] + destinationCoords[0]) / 2,
        (pickupCoords[1] + destinationCoords[1]) / 2
    ], [pickupCoords, destinationCoords]);

    // Stable map key
    const mapKey = useMemo(() => 
        `map-${ride.id || 'preview'}-${ride.origin}-${ride.destination}`,
        [ride.id, ride.origin, ride.destination]
    );

    // Memoize icons
    const pickupIcon = useMemo(() => createPickupIcon3D(), []);
    const destIcon = useMemo(() => createDestinationIcon3D(), []);

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
