/**
 * ============================================
 * ADMIN MAP COMPONENT
 * ============================================
 *
 * Admin-only map component for ride monitoring.
 * Reuses the Leaflet routing infrastructure from RoutePreviewMap.
 *
 * FEATURES:
 * - Real road-based routing using OSRM (shortest path)
 * - Auto-fit bounds to show entire route
 * - Live driver location polling from backend
 * - Custom 3D markers for pickup, destination, and driver
 * - Responsive design for mobile and desktop
 * - NO progress bar (admin view)
 * - NO SOS trigger button (admins only resolve SOS, not create)
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { X, Navigation, Clock, Route, User, MapPin } from 'lucide-react';
import { createPickupIcon3D, createDestinationIcon3D, createCarIcon3D } from './MapIcons';

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

// ============================================
// Routing Control — uses OSRM for shortest path
// ============================================
interface RoutingControlProps {
    pickupCoords: [number, number];
    destinationCoords: [number, number];
    onRouteFound: (distance: number, duration: number) => void;
}

function RoutingControl({ pickupCoords, destinationCoords, onRouteFound }: RoutingControlProps) {
    const map = useMap();
    const routingControlRef = useRef<L.Routing.Control | null>(null);

    useEffect(() => {
        if (!map) return;

        if (routingControlRef.current) {
            map.removeControl(routingControlRef.current);
            routingControlRef.current = null;
        }

        const pickupIcon = createPickupIcon3D();
        const destIcon = createDestinationIcon3D();

        const routingControl = L.Routing.control({
            waypoints: [
                L.latLng(pickupCoords[0], pickupCoords[1]),
                L.latLng(destinationCoords[0], destinationCoords[1])
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1',
                profile: 'driving'
            }),
            lineOptions: {
                styles: [{ color: '#3b82f6', opacity: 0.8, weight: 6 }],
                extendToWaypoints: true,
                missingRouteTolerance: 0
            },
            show: false,
            addWaypoints: false,
            routeWhileDragging: false,
            fitSelectedRoutes: true,
            showAlternatives: false,
            createMarker: function (i: number, waypoint: any) {
                const icon = i === 0 ? pickupIcon : destIcon;
                return L.marker(waypoint.latLng, { icon, draggable: false });
            }
        } as any).addTo(map);

        routingControl.on('routesfound', function (e: any) {
            const routes = e.routes;
            if (routes && routes.length > 0) {
                const route = routes[0];
                const distance = route.summary.totalDistance / 1000;
                const duration = Math.round(route.summary.totalTime / 60);
                onRouteFound(distance, duration);
                const bounds = L.latLngBounds(
                    route.coordinates.map((coord: any) => [coord.lat, coord.lng])
                );
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        });

        routingControlRef.current = routingControl;

        return () => {
            if (routingControlRef.current && map) {
                try { map.removeControl(routingControlRef.current); } catch (e) {}
                routingControlRef.current = null;
            }
        };
    }, [map, pickupCoords[0], pickupCoords[1], destinationCoords[0], destinationCoords[1]]);

    return null;
}

// Forces Leaflet to recalculate map dimensions after container is shown
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => { map.invalidateSize(); }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
}

// ============================================
// Main AdminMap Component
// ============================================
interface AdminMapProps {
    ride: any;
    onClose: () => void;
}

export const AdminMap = ({ ride, onClose }: AdminMapProps) => {
    const pickupCoords = useMemo(() => getCoordinates(ride.origin), [ride.origin]);
    const destinationCoords = useMemo(() => getCoordinates(ride.destination), [ride.destination]);

    const [distance, setDistance] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(true);

    // Live driver location from backend
    const [driverLat, setDriverLat] = useState<number | null>(null);
    const [driverLng, setDriverLng] = useState<number | null>(null);
    const [driverHeading, setDriverHeading] = useState(0);
    const prevDriverPos = useRef<[number, number] | null>(null);

    const handleRouteFound = (dist: number, dur: number) => {
        setDistance(dist);
        setDuration(dur);
        setIsLoading(false);
    };

    // Calculate heading between two positions
    const calcHeading = (lat1: number, lng1: number, lat2: number, lng2: number) => {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const lat1R = lat1 * Math.PI / 180;
        const lat2R = lat2 * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2R);
        const x = Math.cos(lat1R) * Math.sin(lat2R) - Math.sin(lat1R) * Math.cos(lat2R) * Math.cos(dLng);
        return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
    };

    // Poll driver location from backend
    useEffect(() => {
        const poll = () => {
            fetch(`/api/locations/${ride.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const driverLoc = data.find((l: any) => l.user_id === ride.driver_id);
                        if (driverLoc) {
                            const newLat = driverLoc.latitude;
                            const newLng = driverLoc.longitude;
                            if (prevDriverPos.current) {
                                const heading = calcHeading(
                                    prevDriverPos.current[0], prevDriverPos.current[1],
                                    newLat, newLng
                                );
                                setDriverHeading(heading);
                            }
                            prevDriverPos.current = [newLat, newLng];
                            setDriverLat(newLat);
                            setDriverLng(newLng);
                        }
                    }
                })
                .catch(() => {});
        };

        poll(); // immediate first call
        const interval = setInterval(poll, 3000);
        return () => clearInterval(interval);
    }, [ride.id, ride.driver_id]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    const centerPoint: [number, number] = useMemo(() => [
        (pickupCoords[0] + destinationCoords[0]) / 2,
        (pickupCoords[1] + destinationCoords[1]) / 2
    ], [pickupCoords, destinationCoords]);

    const hasDriverLocation = driverLat !== null && driverLng !== null;

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
                            <h3 className="font-bold text-base sm:text-lg truncate">
                                Admin View — {ride.driver_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 truncate">
                                {ride.origin} → {ride.destination}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                        aria-label="Close map"
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
                                <p className="text-sm font-medium text-gray-600">Loading route...</p>
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

                        {/* Shortest path via OSRM */}
                        <RoutingControl
                            pickupCoords={pickupCoords}
                            destinationCoords={destinationCoords}
                            onRouteFound={handleRouteFound}
                        />

                        {/* Driver marker — only shown when real GPS data is available */}
                        {hasDriverLocation && (
                            <Marker
                                position={[driverLat!, driverLng!]}
                                icon={createCarIcon3D(driverHeading)}
                            >
                                <Popup>
                                    <div className="p-3">
                                        <p className="text-xs font-bold uppercase text-blue-600 mb-1">Driver Location</p>
                                        <p className="text-sm font-semibold text-gray-800">{ride.driver_name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {driverLat!.toFixed(4)}, {driverLng!.toFixed(4)}
                                        </p>
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* Info card — bottom right overlay */}
                    <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-3 sm:p-5 border border-gray-200">
                            <h4 className="font-bold text-gray-900 mb-3 text-sm sm:text-base flex items-center gap-2">
                                <Route className="w-4 h-4 text-blue-600" />
                                Route Information
                            </h4>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <Navigation className="w-4 h-4" />
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
                                <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                    <span className="text-sm text-gray-600 flex items-center gap-2">
                                        <User className="w-4 h-4" />
                                        Driver
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 truncate ml-2 max-w-[150px]">
                                        {ride.driver_name}
                                    </span>
                                </div>
                                {hasDriverLocation && (
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-xs text-gray-500 font-medium">Live GPS</span>
                                        <span className="text-xs font-bold text-green-600 flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
                                            {driverLat!.toFixed(4)}, {driverLng!.toFixed(4)}
                                        </span>
                                    </div>
                                )}
                                {!hasDriverLocation && (
                                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                        <span className="text-xs text-gray-500 font-medium">GPS Status</span>
                                        <span className="text-xs font-bold text-gray-400">No live data yet</span>
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
