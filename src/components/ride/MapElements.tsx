import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import { Navigation } from 'lucide-react';

export const AGRA_COORDINATES: Record<string, [number, number]> = {
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

export const MapUpdater = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

export const RecenterButton = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    return (
        <div className="absolute top-24 right-4 z-[1000]">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    map.flyTo(center, 15);
                }}
                className="bg-white text-slate-800 p-3 rounded-2xl shadow-xl flex items-center justify-center hover:bg-slate-50 transition-all border border-slate-100"
                title="Recenter"
            >
                <Navigation className="w-5 h-5 text-primary" />
            </button>
        </div>
    );
};
