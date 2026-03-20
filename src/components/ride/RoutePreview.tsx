import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Navigation, Clock, MapPin, IndianRupee } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapUpdater, RecenterButton } from './MapElements';

// Enhanced Agra coordinates with higher precision
const AGRA_COORDINATES: Record<string, [number, number]> = {
    'Dayalbagh': [27.226100, 78.012500],
    'Sanjay Place': [27.198300, 78.005500],
    'Taj Mahal': [27.175100, 78.042100],
    'Agra Fort': [27.179500, 78.021400],
    'ISBT Agra': [27.215500, 77.942700],
    'Raja Ki Mandi': [27.196100, 77.995500],
    'Sadar Bazaar': [27.161100, 78.011100],
    'Sikandra': [27.220500, 77.950500],
    'Fatehabad Road': [27.160000, 78.040000],
    'Kamla Nagar': [27.210000, 78.020000],
    'Water Works': [27.205000, 78.030000],
    'Bhagwan Talkies': [27.200000, 78.010000],
    'Shahganj': [27.180000, 77.980000],
    'Bodla': [27.190000, 77.950000],
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
    'Civil Lines': [27.180000, 78.010000]
};

interface RoutePreviewProps {
    ride: any;
    onClose: () => void;
}

export const RoutePreview = ({ ride, onClose }: RoutePreviewProps) => {
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [loading, setLoading] = useState(true);
    const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

    const getCoords = (name: string): [number, number] => {
        const nameLower = name.toLowerCase().trim();
        
        // Try exact match first
        const exactMatch = Object.keys(AGRA_COORDINATES).find(k => k.toLowerCase() === nameLower);
        if (exactMatch) return AGRA_COORDINATES[exactMatch];
        
        // Try partial match
        const partialMatch = Object.keys(AGRA_COORDINATES).find(k => 
            nameLower.includes(k.toLowerCase()) || k.toLowerCase().includes(nameLower)
        );
        if (partialMatch) return AGRA_COORDINATES[partialMatch];
        
        // Default to Agra center
        return [27.176700, 78.008100];
    };

    const startCoords = getCoords(ride.origin);
    const endCoords = getCoords(ride.destination);

    useEffect(() => {
        setLoading(true);
        
        // Try OSRM routing first with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`, {
            signal: controller.signal
        })
            .then(res => {
                if (!res.ok) throw new Error('OSRM request failed');
                return res.json();
            })
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    // OSRM success - use real route data
                    const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
                    setRouteCoords(coords);
                    setDistance((data.routes[0].distance / 1000).toFixed(1) + ' km');
                    setDuration(Math.round(data.routes[0].duration / 60) + ' min');
                } else {
                    throw new Error('No routes found');
                }
            })
            .catch(err => {
                console.warn('OSRM routing failed, using fallback:', err.message);
                // Fallback to straight line calculation
                const straightDistance = calculateStraightLineDistance(startCoords, endCoords);
                const estimatedDuration = Math.round(straightDistance * 2.5); // Realistic city driving estimate
                
                setDistance(straightDistance.toFixed(1) + ' km');
                setDuration(estimatedDuration + ' min');
                setRouteCoords([startCoords, endCoords]); // Simple straight line
            })
            .finally(() => {
                clearTimeout(timeoutId);
                setLoading(false);
            });
            
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [ride.origin, ride.destination, startCoords, endCoords]);

    // Helper function to calculate straight-line distance
    const calculateStraightLineDistance = (coord1: [number, number], coord2: [number, number]): number => {
        const R = 6371; // Earth's radius in km
        const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
        const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const pinIcon = (color: string) => L.divIcon({
        html: `<div class="${color} p-1.5 rounded-full border-2 border-white shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
        className: 'custom-div-icon',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });

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
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-[1000]">
                            <div className="bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
                                <div className="w-5 h-5 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                                <p className="text-slate-600 font-bold text-sm">Loading route...</p>
                            </div>
                        </div>
                    )}
                    <MapContainer
                        center={startCoords}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <MapUpdater center={startCoords} />

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
