import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Navigation, Clock, MapPin } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import L from 'leaflet';
import { AGRA_COORDINATES, MapUpdater, RecenterButton } from './MapElements';

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
        const key = Object.keys(AGRA_COORDINATES).find(k => name.toLowerCase().includes(k.toLowerCase()));
        return key ? AGRA_COORDINATES[key] : [27.1767, 78.0081];
    };

    const startCoords = getCoords(ride.origin);
    const endCoords = getCoords(ride.destination);

    useEffect(() => {
        setLoading(true);
        
        // Add AbortController for 5 seconds timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        fetch(`https://router.project-osrm.org/route/v1/driving/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?overview=full&geometries=geojson`, {
            signal: controller.signal
        })
            .then(res => res.json())
            .then(data => {
                if (data.routes && data.routes.length > 0) {
                    const coords = data.routes[0].geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]] as [number, number]);
                    setRouteCoords(coords);
                    setDistance((data.routes[0].distance / 1000).toFixed(1) + ' km');
                    setDuration(Math.round(data.routes[0].duration / 60) + ' min');
                }
            })
            .catch(err => {
                            })
            .finally(() => {
                clearTimeout(timeoutId);
                setLoading(false);
            });
            
        return () => {
            clearTimeout(timeoutId);
            controller.abort();
        };
    }, [ride.origin, ride.destination]);

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

                    {!loading && (distance || duration) && (
                        <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-xl border border-slate-100">
                            <div className="flex items-center gap-6">
                                {distance && (
                                    <div className="flex items-center gap-2">
                                        <Navigation className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Distance</p>
                                            <p className="text-lg font-bold text-slate-800">{distance}</p>
                                        </div>
                                    </div>
                                )}
                                {duration && (
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-primary" />
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Duration</p>
                                            <p className="text-lg font-bold text-slate-800">{duration}</p>
                                        </div>
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
