import { useState, useEffect, useRef } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
    Navigation, ChevronRight, Clock, MapPin, User, Star, Calendar,
    IndianRupee, Phone, MessageSquare, Search, CheckCircle, XCircle,
    Eye, X, ChevronDown, ArrowRight, Car
} from 'lucide-react';
import { User as UserType } from '../types';
import { RatingModal } from '../components/ride/RatingModal';
import { GoogleMap } from '../components/ride/GoogleMap';
import SOSButton from '../components/ride/SOSButton';

/* ─── Types ──────────────────────────────────────────────────────────────── */
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

/* ─── Animated Count-Up ──────────────────────────────────────────────────── */
const CountUp = ({ target, duration = 800 }: { target: number; duration?: number }) => {
    const [count, setCount] = useState(0);
    const raf = useRef<number>(0);

    useEffect(() => {
        const start = performance.now();
        const tick = (now: number) => {
            const progress = Math.min((now - start) / duration, 1);
            setCount(Math.floor(progress * target));
            if (progress < 1) raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [target, duration]);

    return <>{count}</>;
};

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
const StatSkeleton = () => (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] animate-pulse border-l-4 border-gray-200">
        <div className="h-10 w-12 bg-gray-200 rounded mb-2" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
    </div>
);

const CardSkeleton = () => (
    <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] animate-pulse">
        <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
            </div>
            <div className="h-7 w-24 bg-gray-200 rounded-full" />
        </div>
    </div>
);

/* ─── Status helpers ─────────────────────────────────────────────────────── */
const statusConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode }> = {
    confirmed: {
        bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    pending: {
        bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200',
        icon: <Clock className="w-3.5 h-3.5" />,
    },
    rejected: {
        bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200',
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
    cancelled: {
        bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200',
        icon: <XCircle className="w-3.5 h-3.5" />,
    },
};

const rideStatusConfig: Record<string, { bg: string; text: string; border: string }> = {
    active:    { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    completed: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200'  },
    cancelled: { bg: 'bg-gray-100',  text: 'text-gray-600',   border: 'border-gray-200'   },
};

/* ─── Empty State ────────────────────────────────────────────────────────── */
const EmptyState = ({ filtered, onFind }: { filtered: boolean; onFind: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex flex-col items-center justify-center py-20 px-6 text-center"
        style={{ minHeight: 380 }}
    >
        {/* SVG illustration */}
        <svg width="160" height="130" viewBox="0 0 160 130" fill="none" className="mb-8">
            {/* Calendar base */}
            <rect x="30" y="30" width="100" height="80" rx="10" fill="#F3F4F6" />
            <rect x="30" y="30" width="100" height="24" rx="10" fill="#E5E7EB" />
            <rect x="30" y="42" width="100" height="12" fill="#E5E7EB" />
            {/* Calendar dots */}
            <circle cx="52" cy="72" r="5" fill="#D1D5DB" />
            <circle cx="72" cy="72" r="5" fill="#D1D5DB" />
            <circle cx="92" cy="72" r="5" fill="#D1D5DB" />
            <circle cx="112" cy="72" r="5" fill="#D1D5DB" />
            <circle cx="52" cy="90" r="5" fill="#D1D5DB" />
            <circle cx="72" cy="90" r="5" fill="#FED7AA" />
            <circle cx="92" cy="90" r="5" fill="#D1D5DB" />
            {/* Calendar rings */}
            <rect x="55" y="22" width="6" height="16" rx="3" fill="#9CA3AF" />
            <rect x="99" y="22" width="6" height="16" rx="3" fill="#9CA3AF" />
            {/* Person */}
            <circle cx="118" cy="38" r="12" fill="#FED7AA" />
            <path d="M106 60 Q118 52 130 60" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Question mark */}
            <text x="114" y="42" fontSize="14" fontWeight="bold" fill="#F97316">?</text>
            {/* Road */}
            <rect x="20" y="118" width="120" height="6" rx="3" fill="#E5E7EB" />
            <rect x="55" y="119" width="14" height="4" rx="2" fill="#D1D5DB" />
            <rect x="75" y="119" width="14" height="4" rx="2" fill="#D1D5DB" />
            <rect x="95" y="119" width="14" height="4" rx="2" fill="#D1D5DB" />
        </svg>

        <h3 className="text-xl font-extrabold text-gray-900 mb-2">
            {filtered ? 'No bookings match your filters' : 'No bookings yet'}
        </h3>
        <p className="text-gray-500 text-sm mb-8 max-w-xs leading-relaxed">
            {filtered
                ? 'Try adjusting your search or filter criteria to find what you\'re looking for.'
                : 'Start by searching for rides and making your first booking.'}
        </p>
        {!filtered && (
            <button
                onClick={onFind}
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA6C0A] text-white font-semibold
                    px-8 py-3 rounded-full transition-colors text-sm"
            >
                Find Rides
                <ArrowRight className="w-4 h-4" />
            </button>
        )}
    </motion.div>
);

/* ─── Booking Card ───────────────────────────────────────────────────────── */
const BookingCard = ({
    booking, index, user, onTrack, onRate,
}: {
    booking: Booking;
    index: number;
    user: UserType;
    onTrack: () => void;
    onRate: () => void;
}) => {
    const sc = statusConfig[booking.status] ?? statusConfig.cancelled;
    const rc = rideStatusConfig[booking.ride_status] ?? rideStatusConfig.cancelled;
    const upcoming = new Date(booking.departure_time) > new Date();
    const canTrack = booking.status === 'confirmed' && booking.ride_status === 'active' && upcoming;
    const canSOS   = booking.status === 'confirmed' && booking.ride_status === 'active' && !upcoming;
    const canRate  = booking.status === 'confirmed' && booking.ride_status === 'completed';

    const driverInitial = booking.driver_name?.charAt(0).toUpperCase() ?? 'D';

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.10)' }}
            className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] overflow-hidden transition-shadow"
        >
            {/* Top accent bar by booking status */}
            <div className={`h-1 w-full ${
                booking.status === 'confirmed' ? 'bg-green-400' :
                booking.status === 'pending'   ? 'bg-orange-400' :
                booking.status === 'rejected'  ? 'bg-red-400' : 'bg-gray-300'
            }`} />

            <div className="p-5 sm:p-6">
                {/* Row 1: Icon + Route + Badges */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                        <Car className="w-6 h-6 text-orange-500" />
                    </div>

                    {/* Route + meta */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="font-bold text-gray-900 text-base truncate max-w-[140px] sm:max-w-none">
                                {booking.origin}
                            </span>
                            <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />
                            <span className="font-bold text-gray-900 text-base truncate max-w-[140px] sm:max-w-none">
                                {booking.destination}
                            </span>
                        </div>
                        <div className="flex items-center flex-wrap gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                                <Calendar className="w-3.5 h-3.5" />
                                {new Date(booking.departure_time).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(booking.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-row sm:flex-col gap-2 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                            ${sc.bg} ${sc.text} ${sc.border}`}>
                            {sc.icon}
                            <span className="capitalize">{booking.status}</span>
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border
                            ${rc.bg} ${rc.text} ${rc.border}`}>
                            <span className="capitalize">Ride: {booking.ride_status}</span>
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 my-4" />

                {/* Row 2: Driver info + price + actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Driver */}
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-bold text-sm shrink-0">
                            {driverInitial}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900 text-sm">{booking.driver_name}</p>
                            <p className="text-xs text-gray-500">
                                {booking.driver_vehicle_description || booking.driver_vehicle || 'Driver'}
                            </p>
                        </div>
                    </div>

                    {/* Price + seats */}
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-lg font-extrabold text-orange-500">
                                ₹{booking.counter_offer_price || booking.price_per_seat}
                            </p>
                            <p className="text-xs text-gray-500">
                                {booking.seats_booked} seat{booking.seats_booked > 1 ? 's' : ''}
                            </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            {canSOS && (
                                <SOSButton rideId={booking.ride_id} currentUser={user} onSOSTriggered={() => {}} />
                            )}
                            {canTrack && (
                                <button onClick={onTrack}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors">
                                    <Eye className="w-3.5 h-3.5" />
                                    Track Live
                                </button>
                            )}
                            {canRate && (
                                <button onClick={onRate}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-xs font-semibold transition-colors">
                                    <Star className="w-3.5 h-3.5" />
                                    Rate Ride
                                </button>
                            )}
                            {booking.status === 'confirmed' && booking.driver_phone && (
                                <>
                                    <button className="p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Call driver">
                                        <Phone className="w-4 h-4" />
                                    </button>
                                    <button className="p-2 rounded-lg text-gray-500 hover:text-orange-500 hover:bg-orange-50 transition-colors" title="Message driver">
                                        <MessageSquare className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export const MyBookings = ({ user }: { user: UserType | null }) => {
    const [bookings, setBookings]               = useState<Booking[]>([]);
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
    const [isLoading, setIsLoading]             = useState(true);
    const [searchQuery, setSearchQuery]         = useState('');
    const [statusFilter, setStatusFilter]       = useState<'all' | 'pending' | 'confirmed' | 'rejected' | 'cancelled'>('all');
    const [rideStatusFilter, setRideStatusFilter] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');
    const [ratingRide, setRatingRide]           = useState<any>(null);
    const [trackingRide, setTrackingRide]       = useState<any>(null);
    const navigate = useNavigate();

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
            const res = await fetch(`/api/bookings/passenger/${user?.id}`);
            if (res.ok) setBookings(await res.json());
        } catch { /* silent */ }
        finally { setIsLoading(false); }
    };

    const filterBookings = () => {
        let f = [...bookings];
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            f = f.filter(b =>
                b.origin.toLowerCase().includes(q) ||
                b.destination.toLowerCase().includes(q) ||
                b.driver_name.toLowerCase().includes(q)
            );
        }
        if (statusFilter !== 'all')     f = f.filter(b => b.status === statusFilter);
        if (rideStatusFilter !== 'all') f = f.filter(b => b.ride_status === rideStatusFilter);
        f.sort((a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime());
        setFilteredBookings(f);
    };

    if (!user) return <Navigate to="/login" />;

    const stats = [
        { label: 'TOTAL',     value: bookings.length,                                      color: '#3B82F6', border: 'border-blue-400'   },
        { label: 'CONFIRMED', value: bookings.filter(b => b.status === 'confirmed').length, color: '#16A34A', border: 'border-green-500'  },
        { label: 'PENDING',   value: bookings.filter(b => b.status === 'pending').length,   color: '#F97316', border: 'border-orange-400' },
        { label: 'ACTIVE',    value: bookings.filter(b => b.ride_status === 'active').length, color: '#7C3AED', border: 'border-purple-500' },
    ];

    const isFiltered = searchQuery !== '' || statusFilter !== 'all' || rideStatusFilter !== 'all';

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-16">
            <div className="max-w-[1280px] mx-auto px-6 py-10">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <h1 className="text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight mb-1">
                        My Bookings
                    </h1>
                    <p className="text-gray-500 text-[15px]">
                        Track your ride bookings and manage your journeys.
                    </p>
                </div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {isLoading
                        ? [0,1,2,3].map(i => <StatSkeleton key={i} />)
                        : stats.map((s, i) => (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.07 }}
                                whileHover={{ scale: 1.03, boxShadow: '0 8px 24px rgba(0,0,0,0.10)' }}
                                className={`bg-white rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)]
                                    border-l-4 ${s.border} cursor-default transition-shadow`}
                            >
                                <div className="text-[40px] font-extrabold leading-none mb-1.5" style={{ color: s.color }}>
                                    <CountUp target={s.value} />
                                </div>
                                <div className="text-[12px] font-semibold text-gray-500 tracking-widest uppercase">
                                    {s.label}
                                </div>
                            </motion.div>
                        ))
                    }
                </div>

                {/* ── Search & Filter Bar ── */}
                <div className="bg-white rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.07)] p-4 sm:p-5 mb-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search input */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by location or driver name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-10 py-2.5 border border-[#E5E7EB] rounded-xl text-sm
                                    outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Status filter */}
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value as any)}
                                className={`appearance-none pl-4 pr-9 py-2.5 border rounded-xl text-sm font-medium
                                    outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all bg-white
                                    ${statusFilter !== 'all' ? 'border-orange-400 text-orange-600' : 'border-[#E5E7EB] text-gray-700'}`}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="rejected">Rejected</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* Ride status filter */}
                        <div className="relative">
                            <select
                                value={rideStatusFilter}
                                onChange={e => setRideStatusFilter(e.target.value as any)}
                                className={`appearance-none pl-4 pr-9 py-2.5 border rounded-xl text-sm font-medium
                                    outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition-all bg-white
                                    ${rideStatusFilter !== 'all' ? 'border-orange-400 text-orange-600' : 'border-[#E5E7EB] text-gray-700'}`}
                            >
                                <option value="all">All Rides</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                {/* ── Bookings List ── */}
                <div className="space-y-4">
                    {isLoading ? (
                        [0,1,2].map(i => <CardSkeleton key={i} />)
                    ) : filteredBookings.length === 0 ? (
                        <EmptyState filtered={isFiltered} onFind={() => navigate('/search')} />
                    ) : (
                        filteredBookings.map((booking, i) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                index={i}
                                user={user}
                                onTrack={() => setTrackingRide({
                                    id: booking.ride_id,
                                    driver_id: booking.driver_id,
                                    driver_name: booking.driver_name,
                                    origin: booking.origin,
                                    destination: booking.destination,
                                })}
                                onRate={() => setRatingRide({
                                    id: booking.ride_id,
                                    driver_id: booking.driver_id,
                                    driver_name: booking.driver_name,
                                })}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            <AnimatePresence>
                {ratingRide && (
                    <RatingModal ride={ratingRide} currentUser={user} onClose={() => setRatingRide(null)} />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {trackingRide && (
                    <GoogleMap ride={trackingRide} currentUser={user} onClose={() => setTrackingRide(null)} isBooked={true} />
                )}
            </AnimatePresence>
        </div>
    );
};
