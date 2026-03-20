import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Search, User, Clock, IndianRupee, ChevronRight, Shield, MessageSquare, TrendingUp, Navigation, Car,Bike, Map as MapIcon, Info, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '../types';
import { StarRating } from '../components/ride/StarRating';
import { GoogleMap } from '../components/ride/GoogleMap';
import { RoutePreview } from '../components/ride/RoutePreview';
import { useToast } from '../contexts/ToastContext';

type SortOption = 'earliest' | 'price' | 'twoWheeler' | 'arrival';

export const SearchRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [bookingRideId, setBookingRideId] = useState<number | null>(null);
    const [selectedRide, setSelectedRide] = useState<any>(null);
    const [previewRide, setPreviewRide] = useState<any>(null);
    const [userBookings, setUserBookings] = useState<Set<number>>(new Set());
    const [counterOfferPrice, setCounterOfferPrice] = useState<number | null>(null);
    const [showCounterOffer, setShowCounterOffer] = useState(false);
    const [pendingBookings, setPendingBookings] = useState<Set<number>>(new Set());
    const [selectedSorts, setSelectedSorts] = useState<Set<SortOption>>(new Set(['earliest']));
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const toast = useToast();

    /**
     * Toggle sort option on/off
     * Allows multiple sort criteria to be active simultaneously
     */
    const toggleSort = (sort: SortOption) => {
        setSelectedSorts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(sort)) {
                newSet.delete(sort);
            } else {
                newSet.add(sort);
            }
            return newSet;
        });
    };

    const clearAllSorts = () => {
        setSelectedSorts(new Set());
    };

    // Prevent body scroll on this page
    useEffect(() => {
        document.body.classList.add('no-scroll');
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    useEffect(() => {
        const fetchRides = async () => {
            const res = await fetch('/api/rides');
            const data = await res.json();

            const ridesWithRatings = await Promise.all(data.map(async (ride: any) => {
                const ratingRes = await fetch(`/api/ratings/${ride.driver_id}`);
                const ratingData = await ratingRes.json();
                return { ...ride, avg_rating: ratingData.average || 4.5 };
            }));

            setRides(ridesWithRatings);
            setLoading(false);
        };
        fetchRides();
    }, []);

    const fetchBookingStatus = () => {
        if (!user) return;
        fetch(`/api/bookings/passenger/${user.id}`)
            .then(res => res.json())
            .then(bookings => {
                const pendingRideIds = new Set(
                    bookings
                        .filter((b: any) => b.status === 'pending')
                        .map((b: any) => b.ride_id)
                );
                setPendingBookings(pendingRideIds);
                
                const confirmedRideIds = new Set(
                    bookings
                        .filter((b: any) => b.status === 'confirmed')
                        .map((b: any) => b.ride_id)
                );
                setUserBookings(confirmedRideIds);
            });
    };
    
    useEffect(() => {
        fetchBookingStatus();
        const interval = setInterval(fetchBookingStatus, 5000);
        return () => clearInterval(interval);
    }, [user]);

    const handleConfirmBooking = async (rideId: number) => {
        if (!user) {
            toast.warning('Please login to book a ride');
            return;
        }
        
        const res = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                ride_id: rideId, 
                passenger_id: user.id, 
                seats_booked: 1,
                counter_offer_price: counterOfferPrice 
            })
        });
        
        if (res.ok) {
            const data = await res.json();
            toast.success(data.message || 'Booking request sent successfully!');
            setBookingRideId(null);
            setCounterOfferPrice(null);
            setShowCounterOffer(false);
            setPendingBookings(prev => new Set([...prev, rideId]));
            const updated = await fetch('/api/rides').then(r => r.json());
            setRides(updated);
        } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to book ride. Please try again.');
        }
    };

    /**
     * Filter and sort rides based on search query and selected sort options
     * Supports multiple simultaneous sort criteria
     */
    const sortedAndFilteredRides = [...rides]
        .filter(ride => {
            if (!searchQuery.trim()) return true;
            const query = searchQuery.toLowerCase();
            return (
                ride.origin.toLowerCase().includes(query) ||
                ride.destination.toLowerCase().includes(query) ||
                ride.driver_name.toLowerCase().includes(query)
            );
        })
        .sort((a, b) => {
            // If no sorts selected, return original order
            if (selectedSorts.size === 0) {
                return 0;
            }
            
            // Apply multiple sort criteria in order of selection
            for (const sort of Array.from(selectedSorts)) {
                let comparison = 0;
                switch (sort) {
                    case 'earliest':
                        comparison = new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
                        break;
                    case 'price':
                        comparison = a.price_per_seat - b.price_per_seat;
                        break;
                    case 'twoWheeler':
                        // Prioritize 2-wheelers (show them first)
                        const aIs2Wheeler = (a.driver_vehicle?.toLowerCase().includes('2-wheeler') || 
                                           a.vehicle_type?.toLowerCase().includes('2-wheeler')) ? 1 : 0;
                        const bIs2Wheeler = (b.driver_vehicle?.toLowerCase().includes('2-wheeler') || 
                                           b.vehicle_type?.toLowerCase().includes('2-wheeler')) ? 1 : 0;
                        comparison = bIs2Wheeler - aIs2Wheeler;
                        break;
                    case 'arrival':
                        // Future enhancement: implement actual distance calculation
                        comparison = 0;
                        break;
                }
                if (comparison !== 0) return comparison;
            }
            return 0;
        });

    return (
        <div className="flex flex-col lg:flex-row bg-gray-50 fixed inset-0 top-16">
            {/* Left Sidebar - Fixed, No Scroll */}
            <aside className="hidden lg:flex lg:w-80 xl:w-96 bg-white flex-shrink-0 border-r border-gray-200 flex-col h-full overflow-hidden">
                <div className="p-4 space-y-4">
                    {/* Sort by Section */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900">Sort by</h3>
                                <button 
                                    onClick={clearAllSorts}
                                    className="text-sm text-gray-400 hover:text-gray-600 font-medium transition-colors"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-2.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedSorts.has('earliest') ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                            {selectedSorts.has('earliest') && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">Earliest departure</span>
                                    </div>
                                    
                                    <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
                                        <Clock className="w-3 h-3 text-yellow-600" />
                                    </div>
                                   
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSorts.has('earliest')}
                                        onChange={() => toggleSort('earliest')}
                                        className="hidden" 
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-2.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedSorts.has('price') ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                            {selectedSorts.has('price') && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">Lowest price</span>
                                    </div>
                                    
                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
                                        <IndianRupee className="w-3 h-3 text-green-600" />
                                    </div>
                                    
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSorts.has('price')}
                                        onChange={() => toggleSort('price')}
                                        className="hidden" 
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-2.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedSorts.has('twoWheeler') ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                            {selectedSorts.has('twoWheeler') && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">2-wheeler</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Bike className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSorts.has('twoWheeler')}
                                        onChange={() => toggleSort('twoWheeler')}
                                        className="hidden" 
                                    />
                                </label>

                                <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center space-x-2.5">
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                            selectedSorts.has('arrival') ? 'border-blue-600 bg-blue-600' : 'border-gray-300 group-hover:border-blue-400'
                                        }`}>
                                            {selectedSorts.has('arrival') && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">Close to arrival point</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Navigation className="w-3 h-3 text-purple-600" />
                                    </div>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedSorts.has('arrival')}
                                        onChange={() => toggleSort('arrival')}
                                        className="hidden" 
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Safety Tips */}
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                            <h3 className="text-base font-bold text-gray-900 mb-2.5 flex items-center">
                                Safety Tips
                            </h3>
                            <div className="space-y-2">
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-700 leading-relaxed">Always check driver ratings and vehicle information before booking.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-700 leading-relaxed">Let friends or family know your ride details and expected arrival time.</p>
                                </div>
                                <div className="flex items-start space-x-2">
                                    <AlertCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-gray-700 leading-relaxed">Choose well-lit, public pickup and drop-off locations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
            </aside>

            {/* Main Content - Scrollable Ride List */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto overscroll-contain" data-scroll-container>
                    <div className="max-w-4xl mx-auto px-3 sm:px-5 py-4 pb-20">
                    {/* Header */}
                    <div className="mb-4">
                        <h1 className="text-xl font-bold text-gray-900">Available Rides</h1>
                        <p className="text-sm text-gray-600 mt-1">Find commuters traveling your way in Agra</p>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="flex items-center bg-white border border-gray-300 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-all shadow-sm">
                            <Search className="w-4 h-4 text-gray-400 mr-3" />
                            <input 
                                placeholder="Search landmarks, driver name..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="outline-none flex-1 text-sm font-medium placeholder-gray-400" 
                            />
                        </div>
                    </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
                        <p className="text-sm text-gray-600 font-medium">Finding Rides...</p>
                    </div>
                ) : (
                    <div className="space-y-3 pb-8">
                        {sortedAndFilteredRides.map(ride => {
                            const isExpanding = bookingRideId === ride.id;
                            const isFull = ride.available_seats === 0;
                            const hasBooked = userBookings.has(ride.id);
                            const hasPending = pendingBookings.has(ride.id);
                            const isOwnRide = user?.id === ride.driver_id;
                            const isDisabled = isFull || hasBooked || isOwnRide || hasPending;
                            
                            return (
                                <motion.div
                                    key={ride.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-xl border border-gray-200 p-2.5 sm:p-3.5 transition-shadow ${isDisabled && !isOwnRide ? 'opacity-60' : ''} ${isOwnRide ? 'border-2 border-orange-200 bg-orange-50/30' : ''}`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3 flex-1 cursor-pointer" onClick={() => setSelectedRide(ride)}>
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-white shadow-sm">
                                                <User className="text-gray-600 w-5 h-5" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-sm text-gray-900 flex items-center space-x-2">
                                                    <span>{ride.driver_name}</span>
                                                    {isOwnRide && (
                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">YOUR RIDE</span>
                                                    )}
                                                </h3>
                                                <div className="flex items-center space-x-1.5 mt-0.5">
                                                    <StarRating rating={ride.avg_rating || 5} size="sm" />
                                                    <span className="text-gray-500 text-xs font-medium">{(ride.avg_rating || 5).toFixed(1)}</span>
                                                    <span className="text-gray-300 text-xs">•</span>
                                                    <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                                                        {ride.driver_vehicle || ride.vehicle_type || '4-wheeler'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <div className="text-lg font-bold text-gray-900">₹{ride.price_per_seat}</div>
                                                <div className="text-xs text-gray-500">per seat</div>
                                            </div>
                                            <button
                                                onClick={() => !isDisabled && setBookingRideId(isExpanding ? null : ride.id)}
                                                disabled={isDisabled}
                                                className={`px-4 py-1.5 rounded-lg font-semibold text-sm transition-all ${
                                                    isExpanding 
                                                        ? 'bg-gray-600 text-white' 
                                                        : isDisabled 
                                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                                                }`}
                                            >
                                                {isOwnRide ? 'Your Ride' : isFull ? 'Full' : hasBooked ? 'Booked' : hasPending ? 'Pending' : isExpanding ? 'Cancel' : 'Book'}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-2.5 flex items-center space-x-3 cursor-pointer" onClick={() => setSelectedRide(ride)}>
                                        <div className="flex-1 bg-gray-50 rounded-lg p-2.5">
                                            <div className="flex items-center space-x-2.5">
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-500 mb-0.5">From</div>
                                                    <div className="font-semibold text-sm text-gray-900">{ride.origin}</div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="text-xs text-gray-500 mb-0.5">To</div>
                                                    <div className="font-semibold text-sm text-gray-900">{ride.destination}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                                            new Date(ride.departure_time) > new Date() 
                                                ? 'bg-green-50 text-green-700 border border-green-200' 
                                                : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            <Clock className="w-3 h-3 inline mr-1" />
                                            {formatDistanceToNow(new Date(ride.departure_time), { addSuffix: false })}
                                        </div>
                                    </div>

                                    <AnimatePresence>
                                        {isExpanding && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                className="bg-gray-50 border-t border-gray-200 -mx-4 mt-3 px-4 py-4 rounded-b-xl"
                                            >
                                                <div className="grid md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
                                                            <Shield className="w-4 h-4 text-orange-600" />
                                                            <span>Driver Insights</span>
                                                        </h4>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Success Rate</span>
                                                                <span className="text-xl font-bold text-gray-900">98%</span>
                                                            </div>
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Completed</span>
                                                                <span className="text-xl font-bold text-gray-900">42 Rides</span>
                                                            </div>
                                                        </div>
                                                        {ride.driver_phone && (
                                                            <div className="card p-4">
                                                                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide block mb-1">Contact Number</span>
                                                                <a href={`tel:${ride.driver_phone}`} className="text-lg font-bold text-orange-600 hover:text-orange-700">
                                                                    {ride.driver_phone}
                                                                </a>
                                                            </div>
                                                        )}
                                                        <p className="text-gray-600 leading-relaxed italic">
                                                            {ride.driver_vehicle_description
                                                                ? `Using: ${ride.driver_vehicle_description}. I travel daily from ${ride.origin} to ${ride.destination}.`
                                                                : `"I travel daily from ${ride.origin} to ${ride.destination} for work. Looking for friendly co-travelers to share the journey and fuel costs!"`}
                                                        </p>
                                                        <button
                                                            onClick={async () => {
                                                                if (!user) {
                                                                    toast.warning('Please login to send messages');
                                                                    return;
                                                                }
                                                                await fetch('/api/messages', {
                                                                    method: 'POST',
                                                                    headers: { 'Content-Type': 'application/json' },
                                                                    body: JSON.stringify({
                                                                        ride_id: ride.id,
                                                                        sender_id: user.id,
                                                                        receiver_id: ride.driver_id,
                                                                        content: "Hi! I'm interested in your ride."
                                                                    })
                                                                });
                                                                toast.success('Message sent successfully!');
                                                                navigate('/inbox');
                                                            }}
                                                            className="flex items-center space-x-2 text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors"
                                                        >
                                                            <MessageSquare className="w-4 h-4" />
                                                            <span>Message Driver</span>
                                                        </button>
                                                    </div>

                                                    <div className="space-y-6">
                                                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center space-x-2">
                                                            <TrendingUp className="w-4 h-4 text-orange-600" />
                                                            <span>Booking Summary</span>
                                                        </h4>
                                                        <div className="card p-6 space-y-4">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-sm text-gray-600 font-medium">Available Seats</span>
                                                                <span className={`badge ${ride.available_seats === 0 ? 'badge-error' : 'badge-primary'}`}>
                                                                    {ride.available_seats === 0 ? 'FULL' : `${ride.available_seats} Seats`}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                                                <div className={`h-full ${ride.available_seats === 0 ? 'bg-red-500' : 'bg-orange-500'}`} style={{ width: `${(1 - ride.available_seats / 4) * 100}%` }} />
                                                            </div>
                                                            
                                                            {/* Counter Offer Section */}
                                                            <div className="pt-4 border-t border-gray-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-sm font-semibold text-gray-900">Price per Seat</span>
                                                                    <span className="text-2xl font-bold text-orange-600">₹{ride.price_per_seat}</span>
                                                                </div>
                                                                
                                                                {!showCounterOffer ? (
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowCounterOffer(true);
                                                                            const suggestedPrice = Math.round(ride.price_per_seat * 0.8);
                                                                            setCounterOfferPrice(suggestedPrice > 0 ? suggestedPrice : ride.price_per_seat - 10);
                                                                        }}
                                                                        className="w-full mt-2 text-xs text-orange-600 font-semibold hover:text-orange-700 underline"
                                                                    >
                                                                        Make a Counter Offer
                                                                    </button>
                                                                ) : (
                                                                    <div className="mt-3 space-y-2">
                                                                        <label className="text-xs font-semibold text-gray-700">Your Offer (₹)</label>
                                                                        <div className="flex space-x-2">
                                                                            <input
                                                                                type="number"
                                                                                min="0"
                                                                                value={counterOfferPrice || ''}
                                                                                onChange={(e) => setCounterOfferPrice(parseInt(e.target.value))}
                                                                                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm font-semibold"
                                                                                placeholder="Enter your price"
                                                                            />
                                                                            <button
                                                                                onClick={() => {
                                                                                    setShowCounterOffer(false);
                                                                                    setCounterOfferPrice(null);
                                                                                }}
                                                                                className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700"
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                        </div>
                                                                        {counterOfferPrice && counterOfferPrice < ride.price_per_seat && (
                                                                            <p className="text-xs text-green-600 font-semibold">
                                                                                Save ₹{ride.price_per_seat - counterOfferPrice}!
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                                                                <span className="text-sm font-semibold text-gray-900">Total Payable</span>
                                                                <span className="text-2xl font-bold text-orange-600">
                                                                    ₹{counterOfferPrice || ride.price_per_seat}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-4">
                                                            {isOwnRide ? (
                                                                <div className="flex-1 bg-orange-50 border-2 border-orange-200 rounded-lg p-6 text-center">
                                                                    <p className="text-sm font-bold text-orange-700 uppercase tracking-wide">This is your ride</p>
                                                                    <p className="text-xs text-gray-600 mt-2">You cannot book your own ride</p>
                                                                </div>
                                                            ) : hasPending ? (
                                                                <div className="flex-1 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
                                                                    <p className="text-sm font-bold text-yellow-700 uppercase tracking-wide">Request Pending</p>
                                                                    <p className="text-xs text-gray-600 mt-2">Waiting for driver approval</p>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => handleConfirmBooking(ride.id)}
                                                                        disabled={isDisabled}
                                                                        className={`btn-primary flex-1 !py-4 flex items-center justify-center space-x-2 ${isDisabled ? '!bg-gray-300 !text-gray-500 cursor-not-allowed' : ''}`}
                                                                    >
                                                                        <span>{isFull ? 'Seats Full' : hasBooked ? 'Already Booked' : counterOfferPrice ? 'Send Counter Offer' : 'Confirm'}</span>
                                                                        {!isDisabled && <ChevronRight className="w-4 h-4" />}
                                                                    </button>
                                                                </>
                                                            )}
                                                            <button
                                                                onClick={() => setSelectedRide(ride)}
                                                                className="btn-secondary !bg-gray-800 !text-white !border-none !py-4 flex items-center justify-center space-x-2"
                                                            >
                                                                <Navigation className="w-4 h-4" />
                                                                <span>Map</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}

                        {rides.length === 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Car className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No rides available right now</h3>
                                <p className="text-gray-600">Check back later or offer your own ride!</p>
                            </div>
                        )}
                        {sortedAndFilteredRides.length === 0 && rides.length > 0 && (
                            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Search className="w-8 h-8 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No rides match your search</h3>
                                <p className="text-gray-600">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                )}
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {selectedRide && (
                    <GoogleMap
                        ride={selectedRide}
                        currentUser={user}
                        onClose={() => setSelectedRide(null)}
                    />
                )}
                {previewRide && (
                    <RoutePreview
                        ride={previewRide}
                        onClose={() => setPreviewRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};