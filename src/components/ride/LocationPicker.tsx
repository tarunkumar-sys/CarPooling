/**
 * ============================================
 * LOCATION PICKER COMPONENT
 * ============================================
 * 
 * Interactive map component for selecting locations
 * 
 * FEATURES:
 * - Click anywhere on map to select location
 * - Search functionality with Nominatim API
 * - Reverse geocoding for address lookup
 * - Smooth interactions without re-renders
 * - Custom marker styling
 * 
 * PERFORMANCE OPTIMIZATIONS:
 * - Memoized map center and custom icon
 * - useCallback for event handlers
 * - Stable map instance with key prop
 * 
 * @component
 */

import { useState, useCallback, useMemo } from 'react';
import { motion } from 'motion/react';
import { MapPin, X, Check, Search as SearchIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Import Agra coordinates for fallback search
const AGRA_COORDINATES: Record<string, [number, number]> = {
    'Dayalbagh': [27.2261, 78.0125],
    'Sanjay Place': [27.1983, 78.0055],
    'Taj Mahal': [27.1751, 78.0421],
    'Agra Fort': [27.1795, 78.0214],
    'ISBT Agra': [27.2155, 77.9427],
    'Raja Ki Mandi': [27.1961, 77.9955],
    'Sadar Bazaar': [27.1611, 78.0111],
    'Sikandra': [27.2205, 77.9505],
    'Fatehabad Road': [27.1600, 78.0400],
    'Kamla Nagar': [27.2100, 78.0200],
    'Water Works': [27.2050, 78.0300],
    'Bhagwan Talkies': [27.2000, 78.0100],
    'Shahganj': [27.1800, 77.9800],
    'Bodla': [27.1900, 77.9500],
    'Khandari': [27.2050, 78.0050],
    'Rambagh': [27.2111, 78.0247],
    'Ram Bagh': [27.2111, 78.0247],
    'Ramabagh': [27.2111, 78.0247],
    'Belanganj': [27.1900, 78.0050],
    'Lohamandi': [27.1850, 78.0000],
    'Pratap Pura': [27.1950, 78.0150],
    'Nunhai': [27.2100, 78.0350],
    'Tajganj': [27.1700, 78.0450],
    'Rakabganj': [27.1750, 78.0250],
    'Civil Lines': [27.1800, 78.0100]
};

interface LocationPickerProps {
    title: string;
    initialLocation?: string;
    onLocationSelect: (location: { name: string; lat: number; lng: number }) => void;
    onClose: () => void;
}

/**
 * Map Events Handler Component
 * Captures map click events for location selection
 * Memoized to prevent unnecessary re-renders
 * 
 * @component
 */
const MapEvents = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

/**
 * Create custom marker icon
 * Returns a Leaflet DivIcon with custom SVG
 */
const createCustomIcon = () => L.divIcon({
    html: `<div class="text-blue-600 drop-shadow-lg"><svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="white"/></svg></div>`,
    className: 'custom-div-icon',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});

/**
 * Location Picker Component
 * 
 * Allows users to select a location by clicking on the map or searching
 * Provides reverse geocoding to get address from coordinates
 * 
 * @param title - Header title for the picker
 * @param initialLocation - Optional initial search query
 * @param onLocationSelect - Callback with selected location {name, lat, lng}
 * @param onClose - Callback when user closes the picker
 */
export const LocationPicker = ({ title, initialLocation, onLocationSelect, onClose }: LocationPickerProps) => {
    const [selectedLocation, setSelectedLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
    const [searchQuery, setSearchQuery] = useState(initialLocation || '');
    const [isSearching, setIsSearching] = useState(false);

    // Default to Agra - memoized to prevent recalculation
    const defaultCenter: [number, number] = useMemo(() => [27.1767, 78.0081], []);

    // Memoize custom icon to prevent recreation
    const customIcon = useMemo(() => createCustomIcon(), []);

    /**
     * Handle map click event
     * Sets temporary coordinates and fetches address via reverse geocoding
     * Uses multiple fallback strategies for better accuracy
     */
    const handleMapClick = useCallback(async (lat: number, lng: number) => {
        // Use higher precision coordinates (6 decimal places = ~0.1m accuracy)
        const preciseLat = parseFloat(lat.toFixed(6));
        const preciseLng = parseFloat(lng.toFixed(6));
        
        // Set immediate coordinates as fallback with better formatting
        const tempLoc = { 
            name: `${preciseLat.toFixed(4)}, ${preciseLng.toFixed(4)}`, 
            lat: preciseLat, 
            lng: preciseLng 
        };
        setSelectedLocation(tempLoc);

        // Try multiple geocoding strategies for better accuracy
        try {
            // Strategy 1: Nominatim with higher zoom for better precision
            const nominatimRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${preciseLat}&lon=${preciseLng}&zoom=18&addressdetails=1&accept-language=en`
            );
            const nominatimData = await nominatimRes.json();
            
            if (nominatimData && nominatimData.display_name) {
                // Extract meaningful location name (remove country, state for cleaner display)
                const parts = nominatimData.display_name.split(',');
                const cleanName = parts.slice(0, 3).join(', ').trim();
                
                setSelectedLocation({ 
                    name: cleanName || nominatimData.display_name, 
                    lat: preciseLat, 
                    lng: preciseLng 
                });
                setSearchQuery(cleanName || nominatimData.display_name);
                return;
            }
        } catch (e) {
            // Continue to fallback strategies
        }

        // Strategy 2: If Nominatim fails, try with different parameters
        try {
            const fallbackRes = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${preciseLat}&lon=${preciseLng}&addressdetails=1`
            );
            const fallbackData = await fallbackRes.json();
            
            if (fallbackData && fallbackData.display_name) {
                const locationName = fallbackData.display_name.split(',')[0] || fallbackData.display_name;
                setSelectedLocation({ 
                    name: locationName, 
                    lat: preciseLat, 
                    lng: preciseLng 
                });
                setSearchQuery(locationName);
                return;
            }
        } catch (e) {
            // Keep coordinate-based name as final fallback
        }
    }, []);

    /**
     * Handle location search with improved accuracy and multiple fallback strategies
     * Searches for location in Agra using Nominatim API with better error handling
     */
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        setIsSearching(true);
        try {
            // Strategy 1: Search with Agra context for better local results
            const agraSearchRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Agra, Uttar Pradesh, India')}&limit=3&bounded=1&viewbox=77.8,27.3,78.2,27.0`
            );
            const agraData = await agraSearchRes.json();
            
            if (agraData && agraData.length > 0) {
                const item = agraData[0];
                const lat = parseFloat(parseFloat(item.lat).toFixed(6));
                const lng = parseFloat(parseFloat(item.lon).toFixed(6));
                
                // Use the most specific part of the address
                const locationName = item.display_name.split(',')[0].trim();
                setSelectedLocation({ name: locationName, lat, lng });
                setSearchQuery(locationName);
                setIsSearching(false);
                return;
            }

            // Strategy 2: Broader search without strict bounds
            const broadSearchRes = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ' Agra')}&limit=3`
            );
            const broadData = await broadSearchRes.json();
            
            if (broadData && broadData.length > 0) {
                const item = broadData[0];
                const lat = parseFloat(parseFloat(item.lat).toFixed(6));
                const lng = parseFloat(parseFloat(item.lon).toFixed(6));
                
                const locationName = item.display_name.split(',')[0].trim();
                setSelectedLocation({ name: locationName, lat, lng });
                setSearchQuery(locationName);
                setIsSearching(false);
                return;
            }

            // Strategy 3: Check against known Agra coordinates
            const knownLocation = Object.keys(AGRA_COORDINATES).find(key => 
                key.toLowerCase().includes(searchQuery.toLowerCase()) || 
                searchQuery.toLowerCase().includes(key.toLowerCase())
            );
            
            if (knownLocation) {
                const [lat, lng] = AGRA_COORDINATES[knownLocation];
                setSelectedLocation({ name: knownLocation, lat, lng });
                setSearchQuery(knownLocation);
                setIsSearching(false);
                return;
            }
            
            alert('Location not found in Agra. Please try a different search term or click on the map.');
        } catch (e) {
            alert('Search failed. Please check your internet connection and try again.');
        } finally {
            setIsSearching(false);
        }
    };

    /**
     * Confirm location selection and close picker
     */
    const handleConfirm = () => {
        if (selectedLocation) {
            onLocationSelect(selectedLocation);
            onClose();
        } else {
            alert('Please select a location on the map first');
        }
    };

    // Determine map center - use selected location or default
    const mapCenter = useMemo(() => 
        selectedLocation ? [selectedLocation.lat, selectedLocation.lng] as [number, number] : defaultCenter,
        [selectedLocation, defaultCenter]
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 top-16 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white relative z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-2xl">
                            <MapPin className="text-blue-600 w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{title}</h3>
                            <p className="text-sm text-slate-500">Tap anywhere on the map or type to search</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Map Container */}
                <div className="relative h-[500px] w-full">
                    {/* Search Box Overlay */}
                    <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
                        <input
                            type="text"
                            placeholder="Search for a location in Agra..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            className="flex-1 px-4 py-3 rounded-2xl border-2 border-white shadow-xl outline-none focus:border-blue-500"
                        />
                        <button 
                            onClick={handleSearch}
                            disabled={isSearching}
                            className="bg-blue-600 text-white px-6 py-3 rounded-2xl shadow-xl font-bold hover:bg-blue-700 disabled:opacity-70 flex items-center gap-2"
                        >
                            <SearchIcon className="w-4 h-4" />
                            {isSearching ? 'Searching...' : 'Search'}
                        </button>
                    </div>

                    {/* Leaflet Map - Key prop ensures it doesn't re-render unnecessarily */}
                    <MapContainer
                        key="location-picker-map"
                        center={mapCenter}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        className="z-0"
                        scrollWheelZoom={true}
                        dragging={true}
                        touchZoom={true}
                        doubleClickZoom={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; OpenStreetMap'
                        />
                        <MapEvents onMapClick={handleMapClick} />
                        
                        {selectedLocation && (
                            <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={customIcon}>
                                <Popup>
                                    <div className="font-bold text-center p-2">
                                        {selectedLocation.name}
                                    </div>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>

                    {/* Bottom Action Bar */}
                    <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-white/95 backdrop-blur p-4 rounded-2xl shadow-2xl border border-slate-100">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 truncate">
                                {selectedLocation ? (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Selected Location</p>
                                        <p className="font-bold text-slate-800 truncate" title={selectedLocation.name}>{selectedLocation.name}</p>
                                        <p className="text-xs text-slate-500 mt-1 font-mono">
                                            {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">No Location Selected</p>
                                        <p className="text-sm text-slate-600">Click on the map or use the search bar</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={handleConfirm}
                                disabled={!selectedLocation}
                                className={`flex shrink-0 items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                                    selectedLocation 
                                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg' 
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                <Check className="w-4 h-4" /> Confirm
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};
