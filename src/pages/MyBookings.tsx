import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
    Navigation, 
    ChevronRight, 
    Clock, 
    MapPin, 
    User, 
    Star, 
    Calendar, 
    IndianRupee,
    Phone,
    MessageSquare,
    Filter,
    Search,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Loader2,
    Eye,
    MoreVertical
} from 'lucide-react';
import { User as UserType } from '../types';
import { RatingModal } from '../components/ride/RatingModal';
import { GoogleMap } from '../components/ride/GoogleMap';
import SOSButton from '../components/ride/SOSButton';

interface Booking {
    id: number;
    ride_id: number;
    driver_id: number;
    driver_name: string;
    driver_phone?: string;
    driver_gender?: string;
    origin: string;
    destination: string;
    departure_time: string;
    seats_booked: number;
    status: 'pending' | 'confirmed' | 'rejected' | 'cancelled';
    ride_status: 'active' | 'completed' | 'cancelled';
    price_per_seat: number;
    counter_offer_price?: number;
    driver_vehicle?: string;
    driver_vehicle_description?: string;
}

export const MyBookings = ({ user }: { user: UserType | null }) => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all');
    const [rideStatusFilter, setRideStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [ratingRide, setRatingRide] = useState<any>(null);
    const [trackingRide, setTrackingRide] = useState<any>(null);
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

    useEffect(() => {
        if (!user) return;
        fetchBookings();
    }, [user]);

    useEffect(() => {
        filterBookings();
    }, [bookings, searchQuery, statusFilter, rideStatusFilter]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/bookings/passenger/${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setBookings(data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterBookings = () => {
        let filtered = bookings;

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(booking => 
                booking.origin.toLowerCase().includes(query) ||
                booking.destination.toLowerCase().includes(query) ||
                booking.driver_name.toLowerCase().includes(query)
            );
        }

        // Filter by booking status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.status === statusFilter);
        }

        // Filter by ride status
        if (rideStatusFilter !== 'all') {
            filtered = filtered.filter(booking => booking.ride_status === rideStatusFilter);
        }

        // Sort by departure time (upcoming first)
        filtered.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());

        setFilteredBookings(filtered);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-4 h-4 text-red-600" />;
            case 'cancelled':
                return <XCircle className="w-4 h-4 text-gray-600" />;
            default:
                return <Clock className="w-4 h-4 text-orange-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmed':
                return 'bg-green-50 text-green-700 border-green-200';
            case 'rejected':
                return 'bg-red-50 text-red-700 border-red-200';
            case 'cancelled':
                return 'bg-gray-50 text-gray-700 border-gray-200';
            default:
                return 'bg-orange-50 text-orange-700 border-orange-200';
        }
    };

    const getRideStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-blue-50 text-blue-700 border-blue-200';
            case 'completed':
                return 'bg-green-50 text-green-700 border-green-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const isUpcoming = (departureTime: string) => {
        return new Date(departureTime) > new Date();
    };

    const canTrackRide = (booking: Booking) => {
        return booking.status === 'confirmed' && 
               booking.ride_status === 'active' && 
               isUpcoming(booking.departure_time);
    };

    const canShowSOS = (booking: Booking) => {
        return booking.status === 'confirmed' && 
               booking.ride_status === 'active' && 
               new Date(booking.departure_time) <= new Date();
    };

    const canRateRide = (booking: Booking) => {
        return booking.status === 'confirmed' && 
               booking.ride_status === 'completed';
    };

    if (!user) return <Navigate to="/login" />;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 pt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex items-center justify-center min-h-[60vh]">
                        <div className="text-center">
                            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                            <p className="text-gray-600 font-medium">Loading your bookings...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookings</h1>
                            <p className="text-gray-600">Track your ride bookings and manage your journeys</p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total', value: bookings.length, color: 'bg-blue-50 text-blue-700' },
                                { label: 'Confirmed', value: bookings.filter(b => b.status === 'confirmed').length, color: 'bg-green-50 text-green-700' },
                                { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, color: 'bg-orange-50 text-orange-700' },
                                { label: 'Active', value: bookings.filter(b => b.ride_status === 'active').length, color: 'bg-purple-50 text-purple-700' }
                            ].map((stat, index) => (
                                <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by location or driver name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex gap-4">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>

                            <select
                                value={rideStatusFilter}
                                onChange={(e) => setRideStatusFilter(e.target.value as any)}
                                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white"
                            >
                                <option value="all">All Rides</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bookings List */}
                <div className="space-y-4">
                    {filteredBookings.map((booking) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                            <Navigation className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-lg font-bold text-gray-900">{booking.origin}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                                <span className="text-lg font-bold text-gray-900">{booking.destination}</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(booking.departure_time).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>{new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="flex flex-col gap-2">
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getStatusColor(booking.status)}`}>
                                            {getStatusIcon(booking.status)}
                                            <span className="capitalize">{booking.status}</span>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${getRideStatusColor(booking.ride_status)}`}>
                                            <span className="capitalize">Ride: {booking.ride_status}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                                                <User className="w-5 h-5 text-gray-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{booking.driver_name}</p>
                                                <p className="text-sm text-gray-600">{booking.driver_vehicle_description || booking.driver_vehicle}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-lg font-bold text-primary">₹{booking.counter_offer_price || booking.price_per_seat}</p>
                                            <p className="text-sm text-gray-600">{booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {/* SOS Button - Show for active confirmed rides that have started */}
                                        {canShowSOS(booking) && (
                                            <SOSButton 
                                                rideId={booking.ride_id}
                                                currentUser={user}
                                                onSOSTriggered={() => {
                                                    // Refresh bookings to show any status changes
                                                    fetchBookings();
                                                }}
                                            />
                                        )}

                                        {/* Track Live Button */}
                                        {canTrackRide(booking) && (
                                            <button
                                                onClick={() => setTrackingRide({
                                                    id: booking.ride_id,
                                                    driver_id: booking.driver_id,
                                                    driver_name: booking.driver_name,
                                                    origin: booking.origin,
                                                    destination: booking.destination
                                                })}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                            >
                                                <Eye className="w-4 h-4" />
                                                <span>Track Live</span>
                                            </button>
                                        )}

                                        {/* Rate Ride Button */}
                                        {canRateRide(booking) && (
                                            <button
                                                onClick={() => setRatingRide({ 
                                                    id: booking.ride_id, 
                                                    driver_id: booking.driver_id, 
                                                    driver_name: booking.driver_name 
                                                })}
                                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 transition-colors"
                                            >
                                                <Star className="w-4 h-4" />
                                                <span>Rate Ride</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Contact Driver */}
                                    {booking.status === 'confirmed' && booking.driver_phone && (
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <Phone className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-600 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
                                                <MessageSquare className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {/* Empty State */}
                    {filteredBookings.length === 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                            <Navigation className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {searchQuery || statusFilter !== 'all' || rideStatusFilter !== 'all' 
                                    ? 'No bookings match your filters' 
                                    : 'No bookings yet'
                                }
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {searchQuery || statusFilter !== 'all' || rideStatusFilter !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Start by searching for rides and making your first booking'
                                }
                            </p>
                            {!searchQuery && statusFilter === 'all' && rideStatusFilter === 'all' && (
                                <button 
                                    onClick={() => window.location.href = '/search'}
                                    className="btn-primary"
                                >
                                    Find Rides
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {ratingRide && (
                    <RatingModal
                        ride={ratingRide}
                        currentUser={user}
                        onClose={() => setRatingRide(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {trackingRide && (
                    <GoogleMap
                        ride={trackingRide}
                        currentUser={user}
                        onClose={() => setTrackingRide(null)}
                        isBooked={true}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
