import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, X, ChevronRight, TrendingUp, AlertCircle, User, MapPin } from 'lucide-react';
import { User as UserType } from '../../types';
import { AGRA_COORDINATES } from './MapElements';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Map updater component to recenter map
function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

// Recenter button component
function RecenterButton({ center }: { center: [number, number] }) {
    const map = useMap();
    return (
        <button
            onClick={() => map.setView(center, 14)}
            className="leaflet-control leaflet-bar bg-white p-2 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
            title="Recenter Map"
        >
            <Navigation className="w-5 h-5 text-blue-600" />
        </button>
    );
}

export const SimulatedMap = ({ ride, currentUser, onClose }: { ride: any, currentUser?: UserType | null, onClose: () => void }) => {
        
    const [mapError, setMapError] = useState<string | null>(null);
    const [routeError, setRouteError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getCoords = (name: string): [number, number] => {
        const key = Object.keys(AGRA_COORDINATES).find(k => name.toLowerCase().includes(k.toLowerCase()));
        return key ? AGRA_COORDINATES[key] : [27.1767, 78.0081];
    };

    const startCoords = getCoords(ride.origin);
    const endCoords = getCoords(ride.destination);

    const [currentLat, setCurrentLat] = useState(startCoords[0]);
    const [currentLng, setCurrentLng] = useState(startCoords[1]);
    const [progress, setProgress] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([startCoords, endCoords]);
    const [routeDistance, setRouteDistance] = useState<number>(0);
    const [routeDuration, setRouteDuration] = useState<number>(0);
    const [allUserLocations, setAllUserLocations] = useState<any[]>([]);

    // Fetch route from OSRM
    useEffect(() => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            setRouteError('Route fetch timeout');
        }, 10000);

        setIsLoading(true);
        
        fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`, {
            signal: controller.signal
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch route');
                return res.json();
            })
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
                    setRouteCoords(coords);
                    setRouteDistance(data.routes[0].distance);
                    setRouteDuration(data.routes[0].duration);
                    setRouteError(null);
                } else {
                    setRouteError('No route found');
                }
            })
            .catch(err => {
                if (err.name !== 'AbortError') {
                                        setRouteError('Using direct route');
                }
            })
            .finally(() => {
                clearTimeout(timeoutId);
                setIsLoading(false);
            });
            
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [startCoords, endCoords]);

    const calculateProgress = (lat: number, lng: number) => {
        const totalDist = Math.sqrt(Math.pow(endCoords[0] - startCoords[0], 2) + Math.pow(endCoords[1] - startCoords[1], 2));
        const currentDist = Math.sqrt(Math.pow(lat - startCoords[0], 2) + Math.pow(lng - startCoords[1], 2));
        return Math.max(0, Math.min(1, currentDist / totalDist));
    };

    // Location tracking and simulation
    useEffect(() => {
        if (isCompleted) return;

        let watchId: number | undefined;
        let pollInterval: NodeJS.Timeout;
        let simInterval: NodeJS.Timeout;

        // Try real geolocation tracking (only for driver)
        if (currentUser && currentUser.id === ride.driver_id && "geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    // Success - start watching
                    setMapError(null);
                    watchId = navigator.geolocation.watchPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            setCurrentLat(latitude);
                            setCurrentLng(longitude);
                            setProgress(calculateProgress(latitude, longitude));

                            const distToTarget = Math.sqrt(Math.pow(latitude - endCoords[0], 2) + Math.pow(longitude - endCoords[1], 2));
                            if (distToTarget < 0.001) setIsCompleted(true);

                            // Push location to server
                            fetch('/api/locations', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    ride_id: ride.id,
                                    user_id: currentUser.id,
                                    latitude,
                                    longitude
                                })
                            }).catch(err => {
                                // Silently handle location update errors
                            });
                        },
                        (error) => {
                            // Silently handle geolocation errors
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                },
                (error) => {
                    // Failed to get location - use simulation
                                        setMapError(null); // Don't show error, just use simulation
                },
                { timeout: 5000 }
            );
        }

        // Poll all user locations from server
        pollInterval = setInterval(() => {
            fetch(`/api/locations/${ride.id}`)
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        setAllUserLocations(data);
                        const driverLoc = data.find(l => l.user_id === ride.driver_id);
                        if (driverLoc && (!currentUser || currentUser.id !== ride.driver_id)) {
                            setCurrentLat(driverLoc.latitude);
                            setCurrentLng(driverLoc.longitude);
                            setProgress(calculateProgress(driverLoc.latitude, driverLoc.longitude));
                            const distToTarget = Math.sqrt(Math.pow(driverLoc.latitude - endCoords[0], 2) + Math.pow(driverLoc.longitude - endCoords[1], 2));
                            if (distToTarget < 0.001) setIsCompleted(true);
                        }
                    }
                })
                .catch(err => {
                    // Silently handle location fetch errors
                });
        }, 3000);

        // Always start simulation for demo purposes
        let simProgress = 0;
        simInterval = setInterval(() => {
            simProgress += 0.005;
            if (simProgress >= 1) {
                simProgress = 1;
                setIsCompleted(true);
                clearInterval(simInterval);
            }
            
            // Only update if not using real location
            if (!watchId) {
                setProgress(simProgress);
                
                if (routeCoords.length > 2) {
                    const totalPoints = routeCoords.length;
                    const targetIndex = Math.min(Math.floor(simProgress * totalPoints), totalPoints - 1);
                    setCurrentLat(routeCoords[targetIndex][0]);
                    setCurrentLng(routeCoords[targetIndex][1]);
                } else {
                    setCurrentLat(startCoords[0] + (endCoords[0] - startCoords[0]) * simProgress);
                    setCurrentLng(startCoords[1] + (endCoords[1] - startCoords[1]) * simProgress);
                }
            }
        }, 1000);

        return () => {
            if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
            if (pollInterval) clearInterval(pollInterval);
            if (simInterval) clearInterval(simInterval);
        };
    }, [ride.id, currentUser, ride.driver_id, isCompleted, routeCoords]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleEndRide = async () => {
        try {
            const res = await fetch(`/api/rides/complete/${ride.id}`, { method: 'POST' });
            if (res.ok) {
                alert("Ride completed successfully!");
                onClose();
            } else {
                throw new Error('Failed to complete ride');
            }
        } catch (error) {
                        alert("Failed to complete ride. Please try again.");
        }
    };

    const triggerSOS = async () => {
        if (!currentUser) return;
        try {
            const res = await fetch('/api/sos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ride_id: ride.id, user_id: currentUser.id })
            });
            if (res.ok) {
                alert("🚨 SOS Alert Sent! Admin has been notified and emergency services contacted.");
            } else {
                throw new Error('SOS failed');
            }
        } catch (error) {
                        alert("Failed to send SOS. Please call emergency services directly: 112");
        }
    };

    // Custom icons
    const carIcon = L.divIcon({
        html: `<div class="bg-blue-600 p-2.5 rounded-xl shadow-xl border-2 border-white text-white marker-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
    });

    const userIcon = (color: string) => L.divIcon({
        html: `<div class="${color} p-2 rounded-full border-2 border-white shadow-xl marker-pulse"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
    });

    const pinIcon = (color: string) => L.divIcon({
        html: `<div class="${color} p-2 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
    });

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-2 md:p-4 bg-slate-900/70 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl relative flex flex-col max-h-[95vh]"
            >
                {/* Header */}
                <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="bg-blue-100 p-3 rounded-xl shrink-0">
                            <Navigation className="text-blue-600 w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold flex items-center gap-2 truncate">
                                Live Tracking: {ride.driver_name}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 truncate">
                                <span className="font-semibold truncate">{ride.origin}</span>
                                <ChevronRight className="w-4 h-4 shrink-0" />
                                <span className="font-semibold truncate">{ride.destination}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
                        aria-label="Close map"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Error Messages */}
                {(mapError || routeError) && (
                    <div className="px-5 py-2 bg-yellow-50 border-b border-yellow-200">
                        <div className="flex items-center gap-2 text-sm text-yellow-800">
                            <AlertCircle className="w-4 h-4" />
                            <span>{mapError || routeError}</span>
                        </div>
                    </div>
                )}

                {/* Map Container */}
                <div className="flex-1 relative min-h-[400px] bg-gray-100">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-medium text-gray-600">Loading map...</p>
                            </div>
                        </div>
                    )}

                    <MapContainer
                        center={startCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={true}
                        scrollWheelZoom={true}
                        dragging={true}
                        touchZoom={true}
                        doubleClickZoom={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />
                        <MapUpdater center={[currentLat, currentLng]} />
                        <RecenterButton center={[currentLat, currentLng]} />

                        {/* Route lines */}
                        <Polyline 
                            positions={routeCoords} 
                            color="#3b82f6" 
                            weight={5} 
                            opacity={0.5} 
                            lineCap="round" 
                            lineJoin="round" 
                        />
                        <Polyline 
                            positions={[startCoords, [currentLat, currentLng]]} 
                            color="#10b981" 
                            weight={5} 
                            opacity={0.9} 
                            lineCap="round" 
                            lineJoin="round" 
                        />

                        {/* Markers */}
                        <Marker position={startCoords} icon={pinIcon('bg-green-500 text-white')}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-xs font-bold uppercase text-green-600 mb-1">Pickup Point</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.origin}</p>
                                </div>
                            </Popup>
                        </Marker>

                        <Marker position={endCoords} icon={pinIcon('bg-red-500 text-white')}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-xs font-bold uppercase text-red-600 mb-1">Destination</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.destination}</p>
                                </div>
                            </Popup>
                        </Marker>

                        <Marker position={[currentLat, currentLng]} icon={carIcon}>
                            <Popup>
                                <div className="p-2">
                                    <p className="text-xs font-bold uppercase text-blue-600 mb-1">Current Location</p>
                                    <p className="text-sm font-semibold text-gray-800">{ride.driver_name}'s Vehicle</p>
                                    <p className="text-xs text-gray-600 mt-1">{Math.round(progress * 100)}% Complete</p>
                                </div>
                            </Popup>
                        </Marker>

                        {/* Passenger markers */}
                        {allUserLocations.filter(loc => loc.user_id !== ride.driver_id).map(loc => (
                            <Marker key={loc.user_id} position={[loc.latitude, loc.longitude]} icon={userIcon('bg-purple-500 text-white')}>
                                <Popup>
                                    <div className="p-2">
                                        <p className="text-xs font-bold uppercase text-purple-600 mb-1">Passenger</p>
                                        <p className="text-sm font-semibold text-gray-800">{loc.user_name || 'Passenger'}</p>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>

                    {/* Floating controls */}
                    <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-3">
                        <div className="bg-white/95 backdrop-blur p-3 rounded-xl border border-gray-200 shadow-lg">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="text-green-600 w-4 h-4" />
                                <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {isCompleted ? 'Completed' : 'In Progress'}
                            </p>
                        </div>

                        {currentUser && (
                            <button 
                                onClick={triggerSOS} 
                                className="bg-red-600 text-white p-3 rounded-xl shadow-lg flex items-center gap-2 hover:bg-red-700 transition-colors animate-pulse"
                            >
                                <AlertCircle className="w-5 h-5" />
                                <span className="font-bold uppercase text-xs tracking-wider">SOS</span>
                            </button>
                        )}
                    </div>

                    {/* Tracking info panel */}
                    <div className="absolute bottom-4 right-4 z-[1000] bg-slate-900 text-white p-5 rounded-2xl shadow-2xl w-80 border border-slate-700">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Live</span>
                            </div>
                            <div className="bg-slate-800 px-2 py-1 rounded-full">
                                <span className="text-xs font-bold text-gray-400">ETA: ~{Math.round((1-progress)*15)}m</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative pl-6 border-l-2 border-dashed border-slate-700 space-y-4">
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-green-500 border-4 border-slate-900" />
                                    <p className="text-xs text-slate-400 font-semibold uppercase">Pickup</p>
                                    <p className="text-sm font-bold truncate">{ride.origin}</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[27px] top-1 w-3 h-3 rounded-full bg-red-500 border-4 border-slate-900" />
                                    <p className="text-xs text-slate-400 font-semibold uppercase">Destination</p>
                                    <p className="text-sm font-bold truncate">{ride.destination}</p>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-800">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-slate-400 font-semibold uppercase">Progress</span>
                                    <span className="text-xs text-blue-400 font-bold">{Math.round(progress*100)}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }} 
                                        animate={{ width: `${progress*100}%` }} 
                                        className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                                        transition={{ duration: 0.5 }}
                                    />
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
                                {currentUser?.id === ride.driver_id && (
                                    <button 
                                        onClick={handleEndRide} 
                                        className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase hover:bg-blue-700 transition-colors"
                                    >
                                        End Ride
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
