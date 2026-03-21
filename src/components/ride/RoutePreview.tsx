import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { X, Navigation, Clock, MapPin, IndianRupee, AlertCircle } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

interface RoutePreviewProps {
    ride: any;
    onClose: () => void;
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

/**
 * Map Bounds Fitter - Automatically fits map to show both markers
 */
function MapBoundsFitter({ startCoords, endCoords }: { startCoords: [number, number]; endCoords: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        const bounds = L.latLngBounds([startCoords, endCoords]);
        map.fitBounds(bounds, { padding: [80, 80], maxZoom: 14 });
    }, [map, startCoords, endCoords]);
    return null;
}

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

export const RoutePreview = ({ ride, onClose }: RoutePreviewProps) => {
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
    const [startCoords, setStartCoords] = useState<[number, number] | null>(null);
    const [endCoords, setEndCoords] = useState<[number, number] | null>(null);

    /**
     * Get coordinates from ride data
     * Priority: 1) Stored lat/lng, 2) Geocode location name
     */
    useEffect(() => {
        const getCoordinates = async () => {
            setLoading(true);
            setError('');
            
            let start: [number, number] | null = null;
            let end: [number, number] | null = null;
            
            // Try to use stored coordinates first
            if (ride.origin_lat && ride.origin_lng) {
                start = [ride.origin_lat, ride.origin_lng];
            } else {
                start = await geocodeLocation(ride.origin);
            }
            
            if (ride.dest_lat && ride.dest_lng) {
                end = [ride.dest_lat, ride.dest_lng];
            } else {
                end = await geocodeLocation(ride.destination);
            }
            
            if (!start || !end) {
                setError('Unable to locate pickup or destination. Please try again.');
                setLoading(false);
                return;
            }
            
            setStartCoords(start);
            setEndCoords(end);
        };
        
        getCoordinates();
    }, [ride]);

    /**
     * Fetch route data using OSRM with instant fallback
     * Supports any distance worldwide - no restrictions
     */
    useEffect(() => {
        if (!startCoords || !endCoords) return;
        
        setLoading(true);
        setError('');
        
        // Calculate instant fallback (straight-line distance)
        const straightDistance = calculateStraightLineDistance(startCoords, endCoords);
        const estimatedDuration = Math.round(straightDistance * 2.5);
        
        // Set instant fallback immediately
        setDistance(straightDistance.toFixed(1) + ' km');
        setDuration(estimatedDuration + ' min');
        setRouteCoords([startCoords, endCoords]);
        setLoading(false);
        
        // Try OSRM routing in background with 3-second timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        fetch(
            `https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`,
            { signal: controller.signal }
        )
            .then(res => {
                if (!res.ok) throw new Error('OSRM request failed');
                return res.json();
            })
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    // OSRM success - update with real route data
                    const coords = data.routes[0].geometry.coordinates.map(
                        (coord: [number, number]) => [coord[1], coord[0]] as [number, number]
                    );
                    setRouteCoords(coords);
                    setDistance((data.routes[0].distance / 1000).toFixed(1) + ' km');
                    setDuration(Math.round(data.routes[0].duration / 60) + ' min');
                }
            })
            .catch(() => {
                // Silent failure - fallback already set
            })
            .finally(() => {
                clearTimeout(timeoutId);
            });
            
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [startCoords, endCoords]);

    /**
     * Calculate straight-line distance between two coordinates (Haversine formula)
     * Works for any distance worldwide
     */
    const calculateStraightLineDistance = useCallback((coord1: [number, number], coord2: [number, number]): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
        const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }, []);

    // Memoize pin icons
    const pinIcon = useMemo(() => (color: string) => L.divIcon({
        html: `<div class="${color} p-1.5 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    }), []);
    
    // Show error state
    if (error) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl p-8 text-center"
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
    if (!startCoords || !endCoords) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
                onClick={onClose}
            >
                <div className="bg-white p-8 rounded-2xl shadow-xl flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                    <p className="text-slate-600 font-bold text-sm">Loading location data...</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl relative"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-primary/5 to-orange-50 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary/10 p-3 rounded-2xl">
                            <Navigation className="text-primary w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Route Preview</h3>
                            <div className="flex items-center gap-3 mt-1 text-sm text-slate-600">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {ride.origin}
                                </span>
                                <span>→</span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> {ride.destination}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors z-[110]">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="relative h-[600px] w-full">
                    <MapContainer
                        center={startCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        key={`route-${ride.id || 'preview'}`}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapInvalidator />
                        <MapBoundsFitter startCoords={startCoords} endCoords={endCoords} />

                        <Marker position={startCoords} icon={pinIcon('bg-emerald-500 text-white')}>
                            <Popup>
                                <div className="p-2 text-center">
                                    <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Pickup Point</p>
                                    <p className="text-sm font-bold text-slate-800">{ride.origin}</p>
                                </div>
                            </Popup>
                        </Marker>

                        <Marker position={endCoords} icon={pinIcon('bg-red-500 text-white')}>
                            <Popup>
                                <div className="p-2 text-center">
                                    <p className="text-[10px] font-black uppercase text-red-600 mb-1">Destination</p>
                                    <p className="text-sm font-bold text-slate-800">{ride.destination}</p>
                                </div>
                            </Popup>
                        </Marker>

                        {routeCoords.length > 0 && (
                            <Polyline
                                positions={routeCoords}
                                color="#3b82f6"
                                weight={6}
                                opacity={0.8}
                                lineCap="round"
                                lineJoin="round"
                            />
                        )}
                    </MapContainer>

                    {!loading && (distance || duration || ride.price_per_seat) && (
                        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100">
                            <div className="space-y-3">
                                <h4 className="text-sm font-bold text-gray-900 mb-2">Route Details</h4>
                                <div className="flex items-center gap-6">
                                    {distance && (
                                        <div className="flex items-center gap-2">
                                            <Navigation className="w-4 h-4 text-primary" />
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Distance</p>
                                                <p className="text-sm font-bold text-slate-800">{distance}</p>
                                            </div>
                                        </div>
                                    )}
                                    {duration && (
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            <div>
                                                <p className="text-xs text-slate-400 font-bold uppercase">Duration</p>
                                                <p className="text-sm font-bold text-slate-800">{duration}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {/* Always show pricing */}
                                {ride.price_per_seat && (
                                    <div className="pt-2 border-t border-gray-200">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400 font-bold uppercase flex items-center gap-1">
                                                <IndianRupee className="w-3 h-3" />
                                                Price per Seat
                                            </span>
                                            <span className="text-lg font-bold text-blue-600">₹{ride.price_per_seat}</span>
                                        </div>
                                        {/* Show cost per km if distance is available */}
                                        {distance && parseFloat(distance) > 0 && (
                                            <div className="flex items-center justify-between mt-1">
                                                <span className="text-xs text-green-600 font-medium">Cost per km</span>
                                                <span className="text-xs font-bold text-green-600">
                                                    ₹{(ride.price_per_seat / parseFloat(distance)).toFixed(1)}/km
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};
