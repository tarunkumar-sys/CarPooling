import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import {
    Car, ChevronRight, Edit, Trash2, Clock, MapPin, IndianRupee,
    Users, Navigation, Share2, Plus, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '../types';
import { BookingRequests } from '../components/booking/BookingRequests';
import { GoogleMap } from '../components/ride/GoogleMap';
import { useToast } from '../contexts/ToastContext';

/* ─── Skeleton Card ─────────────────────────────────────────────────────── */
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-13 h-13 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-3">
                    <div className="h-3 bg-gray-100 rounded w-20" />
                    <div className="h-3 bg-gray-100 rounded w-16" />
                    <div className="h-3 bg-gray-100 rounded w-14" />
                </div>
            </div>
            <div className="h-8 w-20 bg-gray-200 rounded-full" />
        </div>
    </div>
);

/* ─── Empty State ────────────────────────────────────────────────────────── */
const EmptyState = ({ onOffer }: { onOffer: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-24 text-center"
    >
        {/* Inline SVG illustration */}
        <svg width="180" height="120" viewBox="0 0 180 120" fill="none" className="mb-8 opacity-80">
            <rect x="10" y="70" width="160" height="8" rx="4" fill="#E5E7EB" />
            <rect x="30" y="60" width="120" height="4" rx="2" fill="#F3F4F6" />
            {/* Road dashes */}
            <rect x="60" y="72" width="16" height="4" rx="2" fill="#D1D5DB" />
            <rect x="82" y="72" width="16" height="4" rx="2" fill="#D1D5DB" />
            <rect x="104" y="72" width="16" height="4" rx="2" fill="#D1D5DB" />
            {/* Car body */}
            <rect x="55" y="38" width="70" height="32" rx="8" fill="#FED7AA" />
            <rect x="65" y="28" width="50" height="22" rx="6" fill="#FDBA74" />
            {/* Windows */}
            <rect x="68" y="31" width="20" height="14" rx="3" fill="#BFDBFE" />
            <rect x="92" y="31" width="20" height="14" rx="3" fill="#BFDBFE" />
            {/* Wheels */}
            <circle cx="72" cy="72" r="10" fill="#374151" />
            <circle cx="72" cy="72" r="5" fill="#9CA3AF" />
            <circle cx="108" cy="72" r="10" fill="#374151" />
            <circle cx="108" cy="72" r="5" fill="#9CA3AF" />
            {/* Headlight */}
            <rect x="122" y="46" width="8" height="6" rx="2" fill="#FEF08A" />
            {/* Exhaust puffs */}
            <circle cx="42" cy="52" r="5" fill="#F3F4F6" opacity="0.8" />
            <circle cx="34" cy="48" r="4" fill="#F3F4F6" opacity="0.5" />
            <circle cx="27" cy="44" r="3" fill="#F3F4F6" opacity="0.3" />
        </svg>
        <h3 className="text-2xl font-extrabold text-gray-900 mb-2">No rides offered yet</h3>
        <p className="text-gray-500 text-sm mb-8 max-w-xs">
            Start sharing your journey with the community and help others travel smarter.
        </p>
        <button
            onClick={onOffer}
            className="btn-primary flex items-center gap-2 px-6 py-3 text-sm font-semibold"
        >
            <Plus className="w-4 h-4" />
            Offer a Ride
        </button>
    </motion.div>
);

/* ─── Ride Card ──────────────────────────────────────────────────────────── */
const RideCard = ({
    ride,
    onEdit,
    onDelete,
    onComplete,
    onTrack,
    onShare,
    index,
}: {
    ride: any;
    onEdit: () => void;
    onDelete: () => void;
    onComplete: () => void;
    onTrack: () => void;
    onShare: () => void;
    index: number;
}) => {
    const isUpcoming = new Date(ride.departure_time) > new Date();
    const isActive = ride.status === 'active';

    const timeLabel = formatDistanceToNow(new Date(ride.departure_time), { addSuffix: true });

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.3 }}
            whileHover={{ y: -2, boxShadow: '0 8px 28px rgba(0,0,0,0.11)' }}
            className="bg-white rounded-2xl p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.07)] transition-shadow"
        >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                {/* Left: Car icon */}
                <div className="w-13 h-13 rounded-xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0"
                    style={{ width: 52, height: 52 }}>
                    <Car className="w-6 h-6 text-orange-500" />
                </div>

                {/* Center: Route + meta */}
                <div className="flex-1 min-w-0">
                    {/* Route row */}
                    <div className="flex items-center gap-1.5 flex-wrap mb-2">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-bold text-gray-900 text-base leading-tight truncate max-w-[160px] sm:max-w-none">
                            {ride.origin}
                        </span>
                        <ChevronRight className="w-4 h-4 text-orange-500 shrink-0" />
                        <span className="font-bold text-gray-900 text-base leading-tight truncate max-w-[160px] sm:max-w-none">
                            {ride.destination}
                        </span>
                    </div>

                    {/* Meta pills row */}
                    <div className="flex items-center flex-wrap gap-2">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold
                            ${isUpcoming ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                            <Clock className="w-3.5 h-3.5" />
                            {timeLabel}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                            <Users className="w-3.5 h-3.5" />
                            {ride.available_seats} seat{ride.available_seats !== 1 ? 's' : ''}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-700">
                            <IndianRupee className="w-3.5 h-3.5" />
                            ₹{ride.price_per_seat}
                        </span>
                    </div>
                </div>

                {/* Right: Status + actions */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                        ${isActive
                            ? 'bg-green-100 text-green-700'
                            : ride.status === 'completed'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-red-50 text-red-600'
                        }`}>
                        {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        )}
                        {ride.status}
                    </span>

                    {isActive && (
                        <>
                            {/* Share */}
                            <Tooltip label="Share">
                                <button
                                    onClick={onShare}
                                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                    aria-label="Share ride"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            {/* Track */}
                            <Tooltip label="Navigate">
                                <button
                                    onClick={onTrack}
                                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                    aria-label="Track ride"
                                >
                                    <Navigation className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            {/* Edit */}
                            <Tooltip label="Edit">
                                <button
                                    onClick={onEdit}
                                    className="p-2 rounded-lg text-orange-500 hover:bg-orange-50 transition-colors"
                                    aria-label="Edit ride"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            {/* Delete */}
                            <Tooltip label="Delete">
                                <button
                                    onClick={onDelete}
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    aria-label="Delete ride"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </Tooltip>

                            {/* Complete */}
                            <button
                                onClick={onComplete}
                                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-semibold
                                    hover:bg-gray-700 transition-colors whitespace-nowrap"
                                style={{ minWidth: 110 }}
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Complete
                            </button>
                        </>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

/* ─── Simple Tooltip wrapper ─────────────────────────────────────────────── */
const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="relative group">
        {children}
        <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap
            bg-gray-900 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100
            transition-opacity z-10">
            {label}
        </span>
    </div>
);

/* ─── Main Page ──────────────────────────────────────────────────────────── */
export const MyRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRide, setEditingRide] = useState<any>(null);
    const [trackingRide, setTrackingRide] = useState<any>(null);
    const toast = useToast();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departure_time: '',
        available_seats: 4,
        price_per_seat: 50,
    });

    useEffect(() => {
        if (!user) return;
        fetchRides();
    }, [user]);

    const fetchRides = () => {
        if (!user) return;
        setLoading(true);
        fetch(`/api/rides/driver/${user.id}`)
            .then(res => res.json())
            .then(data => { setRides(data); setLoading(false); })
            .catch(() => setLoading(false));
    };

    const completeRide = async (rideId: number) => {
        const res = await fetch(`/api/rides/complete/${rideId}`, { method: 'POST' });
        if (res.ok) {
            setRides(prev => prev.map(r => r.id === rideId ? { ...r, status: 'completed' } : r));
            toast.success('Ride marked as completed!');
        }
    };

    const deleteRide = async (rideId: number) => {
        if (!confirm('Are you sure you want to delete this ride?')) return;
        const res = await fetch(`/api/rides/${rideId}`, { method: 'DELETE' });
        if (res.ok) {
            setRides(prev => prev.filter(r => r.id !== rideId));
            toast.success('Ride deleted successfully!');
        }
    };

    const startEdit = (ride: any) => {
        setEditingRide(ride);
        setFormData({
            origin: ride.origin,
            destination: ride.destination,
            departure_time: new Date(ride.departure_time).toISOString().slice(0, 16),
            available_seats: ride.available_seats,
            price_per_seat: ride.price_per_seat,
        });
    };

    const saveEdit = async () => {
        if (!editingRide) return;
        const res = await fetch(`/api/rides/${editingRide.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        if (res.ok) {
            toast.success('Ride updated successfully!');
            setEditingRide(null);
            fetchRides();
        }
    };

    const shareRide = (ride: any) => {
        const text = `🚗 Ride from ${ride.origin} → ${ride.destination} | ₹${ride.price_per_seat}/seat | ${formatDistanceToNow(new Date(ride.departure_time), { addSuffix: true })} — AgraRide`;
        if (navigator.share) {
            navigator.share({ title: 'AgraRide', text });
        } else {
            navigator.clipboard.writeText(text);
            toast.success('Ride details copied to clipboard!');
        }
    };

    if (!user) return <Navigate to="/login" />;

    const totalRides = rides.length;
    const activeRides = rides.filter(r => r.status === 'active').length;

    return (
        <div className="bg-[#F8F9FA] min-h-screen pt-16">
            <div className="max-w-[1280px] mx-auto px-6 py-10">

                {/* ── Page Header ── */}
                <div className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-1">
                        <h1 className="text-[32px] font-extrabold text-gray-900 leading-tight tracking-tight">
                            My Offered Rides
                        </h1>
                        {!loading && totalRides > 0 && (
                            <div className="flex items-center gap-2 pb-1">
                                <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-semibold">
                                    {totalRides} total
                                </span>
                                {activeRides > 0 && (
                                    <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        {activeRides} active
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-gray-500 text-[15px]">
                        Manage the rides you've shared with the community.
                    </p>
                </div>

                {/* ── Booking Requests ── */}
                {user && <BookingRequests user={user} />}

                {/* ── Rides List ── */}
                <div className="space-y-4 mt-6">
                    {loading ? (
                        [0, 1, 2].map(i => <SkeletonCard key={i} />)
                    ) : rides.length === 0 ? (
                        <EmptyState onOffer={() => navigate('/offer')} />
                    ) : (
                        rides.map((ride, i) => (
                            <RideCard
                                key={ride.id}
                                ride={ride}
                                index={i}
                                onEdit={() => startEdit(ride)}
                                onDelete={() => deleteRide(ride.id)}
                                onComplete={() => completeRide(ride.id)}
                                onTrack={() => setTrackingRide(ride)}
                                onShare={() => shareRide(ride)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── Edit Modal ── */}
            <AnimatePresence>
                {editingRide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setEditingRide(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white w-full max-w-2xl rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Ride</h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Origin</label>
                                    <input type="text" value={formData.origin}
                                        onChange={e => setFormData({ ...formData, origin: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Destination</label>
                                    <input type="text" value={formData.destination}
                                        onChange={e => setFormData({ ...formData, destination: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-900 mb-2">Departure Time</label>
                                    <input type="datetime-local" value={formData.departure_time}
                                        onChange={e => setFormData({ ...formData, departure_time: e.target.value })}
                                        className="input-field" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Available Seats</label>
                                        <input type="number" min="1" max="8" value={formData.available_seats}
                                            onChange={e => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                                            className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Price per Seat (₹)</label>
                                        <input type="number" min="0" value={formData.price_per_seat || ''}
                                            onChange={e => setFormData({ ...formData, price_per_seat: e.target.value ? parseInt(e.target.value) : 0 })}
                                            className="input-field" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-8">
                                <button onClick={saveEdit} className="btn-primary flex-1 py-3">Save Changes</button>
                                <button onClick={() => setEditingRide(null)} className="btn-secondary flex-1 py-3">Cancel</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Live Tracking Modal ── */}
            <AnimatePresence>
                {trackingRide && (
                    <GoogleMap
                        ride={trackingRide}
                        currentUser={user}
                        onClose={() => setTrackingRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
