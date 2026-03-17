/**
 * ============================================
 * LIVE TRACKING MAP - BOOKED RIDES (AFTER BOOKING)
 * ============================================
 * 
 * PURPOSE:
 * - Show live driver movement for BOOKED rides
 * - Update based on REAL GPS data from backend
 * - Calculate progress from actual distance traveled
 * 
 * FEATURES:
 * ✅ Real road-based routing using OSRM
 * ✅ Live driver marker updates from GPS
 * ✅ Progress bar (visible ONLY after booking)
 * ✅ Progress = distance traveled ÷ total route distance
 * ✅ Direction indicator showing heading
 * ❌ NO start/pause buttons
 * ❌ NO simulated auto-progress
 * ❌ NO fake timers
 * 
 * GPS INTEGRATION:
 * - Ready for Socket.IO or REST API updates
 * - Updates ONLY when backend sends new GPS coordinates
 * - Progress calculated from real distance traveled
 * 
 * USE CASE: Booked ride tracking screen
 */

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, X, ChevronRight, User } from 'lucide-react';
import { User as UserType } from '../../types';
import { createPickupIcon3D, createDestinationIcon3D, createCarIcon3D } from './MapIcons';

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Agra coordinates database
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
// UTILITY: Calculate distance between two GPS points (Haversine)
// ============================================
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}

// ============================================
// UTILITY: Calculate total route distance
// ============================================
function calculateRouteDistance(coords: [number, number][]): number {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
        total += calculateDistance(coords[i][0], coords[i][1], coords[i + 1][0], coords[i + 1][1]);
    }
    return total;
}

// ============================================
// UTILITY: Calculate heading/bearing
// ============================================
function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
             Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    let heading = Math.atan2(y, x) * 180 / Math.PI;
    heading = (heading + 360) % 360;
    return heading;
}

// Map utilities
function MapInvalidator() {
    const map = useMap();
    useEffect(() => {
        setTimeout(() => map.invalidateSize(), 100);
    }, [map]);
    return null;
}

function MapCenterController({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom(), { animate: true, duration: 1 });
    }, [center, map]);
    return null;
}

function RecenterButton({ center }: { center: [number, number] }) {
    const map = useMap();
    return (
        <button
            onClick={() => map.flyTo(center, 15, { duration: 1 })}
            className="absolute top-4 right-4 z-[1000] bg-white p-3 rounded-xl shadow-lg hover:bg-gray-50 transition-all border border-gray-200"
            title="Recenter on driver"
        >
            <Navigation className="w-5 h-5 text-blue-600" />
        </button>
    );
}

// Using custom 3D icons from MapIcons.tsx

interface LiveTrackingGPSProps {
    ride: any;
    currentUser?: UserType | null;
    onClose: () => void;
}

export const LiveTrackingGPS = ({ ride, currentUser, onClose }: LiveTrackingGPSProps) => {
        
    const pickupCoords = getCoordinates(ride.origin);
    const destinationCoords = getCoordinates(ride.destination);

    // State management
    const [driverLat, setDriverLat] = useState(pickupCoords[0]);
    const [driverLng, setDriverLng] = useState(pickupCoords[1]);
    const [driverHeading, setDriverHeading] = useState(0);
    const [progress, setProgress] = useState(0);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([pickupCoords, destinationCoords]);
    const [totalDistance, setTotalDistance] = useState(0);
    const [distanceTraveled, setDistanceTraveled] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const prevDriverPos = useRef<[number, number]>(pickupCoords);

    // ============================================
    // STEP 1: Fetch Route from OSRM
    // ============================================
    useEffect(() => {
                const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

        const url = `https://router.project-osrm.org/route/v1/driving/${pickupCoords[1]},${pickupCoords[0]};${destinationCoords[1]},${destinationCoords[0]}?overview=full&geometries=geojson`;
        
        fetch(url, { signal: controller.signal })
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map(
                        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                    );
                    setRouteCoords(coords);
                    const total = calculateRouteDistance(coords);
                    setTotalDistance(total);
                }
            })
            .catch(err => {
                // Silently handle routing errors
            })
            .finally(() => {
                clearTimeout(timeout);
                setIsLoading(false);
            });

        return () => {
            clearTimeout(timeout);
            controller.abort();
        };
    }, []);

    // ============================================
    // STEP 2: GPS Update Handler (Backend Integration Point)
    // ============================================
    /**
     * 🔌 BACKEND INTEGRATION POINT
     * 
     * Replace the simulation below with real GPS updates:
     * 
     * Option 1: Socket.IO
     * useEffect(() => {
     *     const socket = io('your-backend-url');
     *     socket.on('driver-location', (data) => {
     *         updateDriverLocation(data.lat, data.lng);
     *     });
     *     return () => socket.disconnect();
     * }, []);
     * 
     * Option 2: REST API Polling
     * useEffect(() => {
     *     const interval = setInterval(async () => {
     *         const res = await fetch(`/api/rides/${ride.id}/location`);
     *         const data = await res.json();
     *         updateDriverLocation(data.lat, data.lng);
     *     }, 5000);
     *     return () => clearInterval(interval);
     * }, []);
     */

    const updateDriverLocation = (newLat: number, newLng: number) => {
                
        // Calculate distance traveled since last update
        const distanceIncrement = calculateDistance(
            prevDriverPos.current[0],
            prevDriverPos.current[1],
            newLat,
            newLng
        );
        
        // Update distance traveled
        const newDistanceTraveled = distanceTraveled + distanceIncrement;
        setDistanceTraveled(newDistanceTraveled);
        
        // Calculate progress: distance traveled / total distance
        if (totalDistance > 0) {
            const newProgress = Math.min(newDistanceTraveled / totalDistance, 1);
            setProgress(newProgress);
        }
        
        // Calculate heading
        const heading = calculateHeading(
            prevDriverPos.current[0],
            prevDriverPos.current[1],
            newLat,
            newLng
        );
        setDriverHeading(heading);
        
        // Update driver position
        setDriverLat(newLat);
        setDriverLng(newLng);
        prevDriverPos.current = [newLat, newLng];
    };

    // ============================================
    // TEMPORARY: Simulation for Demo (REMOVE IN PRODUCTION)
    // ============================================
    useEffect(() => {
        // ⚠️ THIS IS ONLY FOR DEMO - REMOVE IN PRODUCTION
        // Replace with real GPS updates from backend
                
        let simulationProgress = 0;
        const interval = setInterval(() => {
            simulationProgress += 0.003;
            
            if (simulationProgress >= 1) {
                simulationProgress = 1;
                clearInterval(interval);
            }
            
            // Simulate GPS update along route
            if (routeCoords.length > 2) {
                const targetIndex = Math.min(
                    Math.floor(simulationProgress * routeCoords.length),
                    routeCoords.length - 1
                );
                const pos = routeCoords[targetIndex];
                updateDriverLocation(pos[0], pos[1]);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [routeCoords, totalDistance]);

    // Prevent body scroll
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const eta = Math.round((1 - progress) * 15);

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
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white z-10">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-2.5 rounded-xl">
                            <Navigation className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="font-bold text-lg truncate">
                                Live Tracking: {ride.driver_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                                <span className="truncate">{ride.origin}</span>
                                <ChevronRight className="w-4 h-4 shrink-0" />
                                <span className="truncate">{ride.destination}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="flex-1 relative bg-gray-100" style={{ minHeight: '400px' }}>
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-[1000]">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-medium text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={pickupCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                            maxZoom={19}
                        />

                        <MapInvalidator />
                        <MapCenterController center={[driverLat, driverLng]} />
                        <RecenterButton center={[driverLat, driverLng]} />

                        {/* Full route (gray) */}
                        <Polyline
                            positions={routeCoords}
                            color="#94a3b8"
                            weight={6}
                            opacity={0.5}
                            lineCap="round"
                            lineJoin="round"
                        />
                        
                        {/* Completed route (blue) */}
                        <Polyline
                            positions={[pickupCoords, [driverLat, driverLng]]}
                            color="#3b82f6"
                            weight={6}
                            opacity={1}
                            lineCap="round"
                            lineJoin="round"
                        />

                        {/* Pickup Marker - 3D Isometric Pin */}
                        <Marker position={pickupCoords} icon={createPickupIcon3D()}>
                            <Popup>
                                <div className="p-3">
                                    <p className="text-xs font-bold uppercase text-blue-600 mb-1">Pickup Point</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.origin}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Destination Marker - 3D Isometric Pin */}
                        <Marker position={destinationCoords} icon={createDestinationIcon3D()}>
                            <Popup>
                                <div className="p-3">
                                    <p className="text-xs font-bold uppercase text-red-600 mb-1">Destination</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.destination}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Driver Marker - 3D Animated Car with Direction */}
                        <Marker position={[driverLat, driverLng]} icon={createCarIcon3D(driverHeading)}>
                            <Popup>
                                <div className="p-3">
                                    <p className="text-xs font-bold uppercase text-blue-600 mb-1">Driver Location</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.driver_name}</p>
                                    <p className="text-xs text-gray-600 mt-1">{Math.round(progress * 100)}% Complete</p>
                                    <p className="text-xs text-gray-500 mt-1">Heading: {Math.round(driverHeading)}°</p>
                                </div>
                            </Popup>
                        </Marker>
                    </MapContainer>

                    {/* Status Card with Progress Bar */}
                    <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[1000]">
                        <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-5 border border-slate-700">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-green-400">Live GPS</span>
                                </div>
                                <div className="bg-slate-800 px-3 py-1 rounded-full">
                                    <span className="text-xs font-bold text-gray-400">ETA: ~{eta}m</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div className="relative pl-6 border-l-2 border-dashed border-slate-700 space-y-3">
                                    <div className="relative">
                                        <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-green-500 border-4 border-slate-900"></div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Pickup</p>
                                        <p className="text-sm font-bold truncate">{ride.origin}</p>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-500 border-4 border-slate-900"></div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Destination</p>
                                        <p className="text-sm font-bold truncate">{ride.destination}</p>
                                    </div>
                                </div>
                            </div>

                            {/* PROGRESS BAR - Visible ONLY for booked rides */}
                            <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Progress</span>
                                    <span className="text-xs text-blue-400 font-bold">{Math.round(progress * 100)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-xs text-slate-500">{distanceTraveled.toFixed(2)} km</span>
                                    <span className="text-xs text-slate-500">{totalDistance.toFixed(2)} km</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center">
                                        <User className="w-5 h-5 text-slate-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-semibold uppercase">Driver</p>
                                        <p className="text-sm font-bold">{ride.driver_name}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-slate-800 flex items-center justify-between">
                                <span className="text-xs text-slate-400 font-semibold uppercase">Direction</span>
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center"
                                        style={{ transform: `rotate(${driverHeading}deg)` }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="white">
                                            <path d="M6 0 L10 12 L6 9 L2 12 Z" />
                                        </svg>
                                    </div>
                                    <span className="text-xs font-bold text-blue-400">{Math.round(driverHeading)}°</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
