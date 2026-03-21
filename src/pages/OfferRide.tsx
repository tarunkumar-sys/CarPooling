import { useState, FormEvent } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Car as CarIcon, Bike, MapPin, Navigation, Camera, CheckCircle } from 'lucide-react';
import { User as UserType } from '../types';
import { LocationPicker } from '../components/ride/LocationPicker';
import { LicensePlateOCR } from '../components/ride/LicensePlateOCR';
import { useToast } from '../contexts/ToastContext';

export const OfferRide = ({ user }: { user: UserType | null }) => {
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        origin_lat: null as number | null,
        origin_lng: null as number | null,
        dest_lat: null as number | null,
        dest_lng: null as number | null,
        departure_time: '',
        available_seats: 3,
        price_per_seat: 100,
        vehicle_type: '4-wheeler' as '2-wheeler' | '4-wheeler',
        vehicle_description: ''
    });
    const [showOriginPicker, setShowOriginPicker] = useState(false);
    const [showDestPicker, setShowDestPicker] = useState(false);
    const [showOCR, setShowOCR] = useState(false);
    const [plateVerified, setPlateVerified] = useState(false);
    const navigate = useNavigate();
    const toast = useToast();

    const handlePlateDetected = (plateNumber: string) => {
        // Extract current description and append/replace plate number
        const currentDesc = formData.vehicle_description;
        const platePattern = /[A-Z]{2}\s*\d{1,2}\s*[A-Z]{0,2}\s*\d{1,4}/gi;
        
        if (platePattern.test(currentDesc)) {
            // Replace existing plate number
            setFormData(prev => ({
                ...prev,
                vehicle_description: currentDesc.replace(platePattern, plateNumber)
            }));
        } else {
            // Append plate number to description
            const separator = currentDesc ? ' - ' : '';
            setFormData(prev => ({
                ...prev,
                vehicle_description: prev.vehicle_description + separator + plateNumber
            }));
        }
    };

    const handleVerificationStatus = (isVerified: boolean) => {
        setPlateVerified(isVerified);
        if (isVerified) {
            toast.success('License plate verified successfully!');
        }
    };

    if (!user) return <Navigate to="/login" />;

    const handleOriginSelect = (location: { name: string; lat: number; lng: number }) => {
        setFormData(prev => ({
            ...prev,
            origin: location.name,
            origin_lat: location.lat,
            origin_lng: location.lng
        }));
    };

    const handleDestSelect = (location: { name: string; lat: number; lng: number }) => {
        setFormData(prev => ({
            ...prev,
            destination: location.name,
            dest_lat: location.lat,
            dest_lng: location.lng
        }));
    };

    const handleUseCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
                        const data = await res.json();
                        let locationName = 'Current Location';
                        if (data && data.display_name) {
                            locationName = data.display_name;
                        }
                        handleOriginSelect({ name: locationName, lat, lng });
                    } catch (e) {
                         handleOriginSelect({ name: `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`, lat, lng });
                    }
                },
                (error) => {
                    toast.error('Could not get your location: ' + error.message);
                }
            );
        } else {
            toast.error('Geolocation is not supported by your browser');
        }
    };

    const extractLicensePlate = (description: string): string | null => {
        const platePattern = /[A-Z]{2}\s*\d{1,2}\s*[A-Z]{0,2}\s*\d{1,4}/i;
        const match = description.match(platePattern);
        return match ? match[0].replace(/\s+/g, '').toUpperCase() : null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        const licensePlate = extractLicensePlate(formData.vehicle_description);
        
        const rideData = {
            driver_id: user.id,
            origin: formData.origin,
            destination: formData.destination,
            departure_time: formData.departure_time,
            available_seats: formData.available_seats,
            price_per_seat: formData.price_per_seat,
            driver_vehicle: formData.vehicle_type,
            driver_vehicle_description: formData.vehicle_description,
            license_plate: licensePlate,
            license_plate_verified: plateVerified,
            origin_lat: formData.origin_lat,
            origin_lng: formData.origin_lng,
            dest_lat: formData.dest_lat,
            dest_lng: formData.dest_lng
        };
        
        const res = await fetch('/api/rides', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rideData)
        });
        
        if (res.ok) {
            toast.success('Ride created successfully!');
            navigate('/search');
        } else {
            const error = await res.json();
            toast.error('Failed to create ride: ' + (error.error || 'Unknown error'));
        }
    };

    return (
        <>
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="card-elevated p-8"
                    >
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900">Offer a Ride</h1>
                            <p className="text-gray-600 mt-2">Share your journey and help Agra travel better.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Vehicle Selection */}
                            <div className="space-y-4">
                                <label className="block text-sm font-semibold text-gray-900">Vehicle Type</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vehicle_type: '4-wheeler', available_seats: 3 })}
                                        className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.vehicle_type === '4-wheeler'
                                            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200/50'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <CarIcon className="w-5 h-5" />
                                        <span>4-Wheeler</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, vehicle_type: '2-wheeler', available_seats: 1 })}
                                        className={`flex items-center justify-center space-x-3 py-4 px-6 rounded-lg font-semibold transition-all border-2 ${formData.vehicle_type === '2-wheeler'
                                            ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200/50'
                                            : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                            }`}
                                    >
                                        <Bike className="w-5 h-5" />
                                        <span>2-Wheeler</span>
                                    </button>
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <label className="block text-sm font-semibold text-gray-900">Vehicle Details</label>
                                    <button
                                        type="button"
                                        onClick={() => setShowOCR(!showOCR)}
                                        className="flex items-center space-x-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
                                    >
                                        <Camera className="w-4 h-4" />
                                        <span>{showOCR ? 'Hide Scanner' : 'Scan License Plate'}</span>
                                    </button>
                                </div>
                                
                                {/* License Plate OCR Scanner */}
                                <AnimatePresence>
                                    {showOCR && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-4"
                                        >
                                            <LicensePlateOCR 
                                                onPlateDetected={handlePlateDetected}
                                                onVerificationStatus={handleVerificationStatus}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <input
                                    placeholder="e.g. Honda Amaze (White) - UP80 AB 1234"
                                    className="input-field"
                                    value={formData.vehicle_description}
                                    onChange={e => setFormData({ ...formData, vehicle_description: e.target.value })}
                                    required
                                />
                                <div className="flex items-center justify-between mt-2">
                                    <p className="text-xs text-gray-500">Include make, model, color, and license plate for easy identification</p>
                                    {plateVerified && (
                                        <span className="flex items-center space-x-1 text-xs text-green-600 font-medium">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>Plate Verified</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Location Fields */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">Pickup Point</label>
                                    <div className="relative">
                                        <input
                                            placeholder="e.g. Dayalbagh"
                                            className={`input-field pr-20 ${formData.origin_lat && formData.origin_lng ? 'font-semibold text-gray-800' : ''}`}
                                            value={formData.origin}
                                            onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                            required
                                            readOnly={!!(formData.origin_lat && formData.origin_lng)}
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                                            <button
                                                type="button"
                                                onClick={handleUseCurrentLocation}
                                                className="p-2 rounded-lg transition-colors bg-blue-50 hover:bg-blue-100 text-blue-600"
                                                title="Use Current Location"
                                            >
                                                <Navigation className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowOriginPicker(true)}
                                                className={`p-2 rounded-lg transition-colors ${
                                                    formData.origin_lat && formData.origin_lng 
                                                        ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                        : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                                                }`}
                                                title="Pick on Map"
                                            >
                                                <MapPin className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {formData.origin_lat && formData.origin_lng && (
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-xs text-green-600 font-mono">
                                                ✓ Location pinned: {formData.origin_lat.toFixed(4)}, {formData.origin_lng.toFixed(4)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, origin: '', origin_lat: null, origin_lng: null }))}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">Drop Point</label>
                                    <div className="relative">
                                        <input
                                            placeholder="e.g. Sanjay Place"
                                            className={`input-field pr-12 ${formData.dest_lat && formData.dest_lng ? 'font-semibold text-gray-800' : ''}`}
                                            value={formData.destination}
                                            onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                            required
                                            readOnly={!!(formData.dest_lat && formData.dest_lng)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowDestPicker(true)}
                                            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                                                formData.dest_lat && formData.dest_lng 
                                                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                                                    : 'bg-orange-50 hover:bg-orange-100 text-orange-600'
                                            }`}
                                            title="Pick on Map"
                                        >
                                            <MapPin className="w-4 h-4" />
                                        </button>
                                    </div>
                                    {formData.dest_lat && formData.dest_lng && (
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="text-xs text-green-600 font-mono">
                                                ✓ Location pinned: {formData.dest_lat.toFixed(4)}, {formData.dest_lng.toFixed(4)}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, destination: '', dest_lat: null, dest_lng: null }))}
                                                className="text-xs text-red-500 hover:text-red-700 font-medium"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Time and Price */}
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">Departure Time</label>
                                    <input
                                        type="datetime-local"
                                        className="input-field"
                                        value={formData.departure_time}
                                        onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-3">Price per Seat (₹)</label>
                                    <input
                                        type="number"
                                        min="10"
                                        max="1000"
                                        value={formData.price_per_seat || ''}
                                        className="input-field"
                                        onChange={e => setFormData({ ...formData, price_per_seat: e.target.value ? parseInt(e.target.value) : 0 })}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Available Seats */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-900 mb-3">Available Seats</label>
                                <div className="flex flex-wrap gap-3">
                                    {(formData.vehicle_type === '4-wheeler' ? [1, 2, 3, 4, 5, 6] : [1]).map(num => (
                                        <button
                                            key={num}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, available_seats: num })}
                                            className={`w-12 h-12 rounded-lg font-bold transition-all border-2 ${formData.available_seats === num
                                                ? 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200/50'
                                                : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button className="btn-primary w-full py-4 text-lg flex items-center justify-center space-x-3">
                                <PlusCircle className="w-6 h-6" />
                                <span>Publish Ride</span>
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <AnimatePresence>
                {showOriginPicker && (
                    <LocationPicker
                        title="Select Pickup Point"
                        initialLocation={formData.origin}
                        onLocationSelect={handleOriginSelect}
                        onClose={() => setShowOriginPicker(false)}
                    />
                )}
                {showDestPicker && (
                    <LocationPicker
                        title="Select Drop Point"
                        initialLocation={formData.destination}
                        onLocationSelect={handleDestSelect}
                        onClose={() => setShowDestPicker(false)}
                    />
                )}
            </AnimatePresence>
        </>
    );
};