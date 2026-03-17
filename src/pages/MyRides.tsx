import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Car, ChevronRight, Edit, Trash2, Clock, MapPin, IndianRupee, Users, Navigation, TrendingUp, Activity, CheckCircle, XCircle, Calendar, DollarSign, Star, Award, Target, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow } from 'date-fns';
import { User as UserType } from '../types';
import { BookingRequests } from '../components/booking/BookingRequests';
import { GoogleMap } from '../components/ride/GoogleMap';
import { useToast } from '../contexts/ToastContext';

export const MyRides = ({ user }: { user: UserType | null }) => {
    const [rides, setRides] = useState<any[]>([]);
    const [editingRide, setEditingRide] = useState<any>(null);
    const [trackingRide, setTrackingRide] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const toast = useToast();
    const [formData, setFormData] = useState({
        origin: '',
        destination: '',
        departure_time: '',
        available_seats: 4,
        price_per_seat: 50
    });

    useEffect(() => {
        if (!user) return;
        fetchRides();
        fetchBookings();
    }, [user]);

    const fetchRides = () => {
        if (!user) return;
        fetch(`/api/rides/driver/${user.id}`)
            .then(res => res.json())
            .then(setRides);
    };

    const fetchBookings = () => {
        if (!user) return;
        fetch(`/api/bookings/driver/${user.id}`)
            .then(res => res.json())
            .then(setBookings)
            .catch(() => setBookings([]));
    };

    const completeRide = async (rideId: number) => {
        const res = await fetch(`/api/rides/complete/${rideId}`, { method: 'POST' });
        if (res.ok) {
            setRides(rides.map(r => r.id === rideId ? { ...r, status: 'completed' } : r));
        }
    };

    const deleteRide = async (rideId: number) => {
        if (!confirm('Are you sure you want to delete this ride?')) return;
        const res = await fetch(`/api/rides/${rideId}`, { method: 'DELETE' });
        if (res.ok) {
            setRides(rides.filter(r => r.id !== rideId));
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
            price_per_seat: ride.price_per_seat
        });
    };

    const saveEdit = async () => {
        if (!editingRide) return;
        const res = await fetch(`/api/rides/${editingRide.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            toast.success('Ride updated successfully!');
            setEditingRide(null);
            fetchRides();
        }
    };

    if (!user) return <Navigate to="/login" />;

    // Calculate statistics
    const totalRides = rides.length;
    const activeRides = rides.filter(r => r.status === 'active').length;
    const completedRides = rides.filter(r => r.status === 'completed').length;
    const cancelledRides = rides.filter(r => r.status === 'cancelled').length;
    const upcomingRides = rides.filter(r => new Date(r.departure_time) > new Date() && r.status === 'active').length;
    
    const totalEarnings = bookings
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (b.price_per_seat || 0), 0);
    
    const totalPassengers = bookings.filter(b => b.status === 'confirmed').length;
    const pendingRequests = bookings.filter(b => b.status === 'pending').length;
    
    const completionRate = totalRides > 0 ? ((completedRides / totalRides) * 100).toFixed(0) : 0;
    const avgSeatsPerRide = totalRides > 0 ? (rides.reduce((sum, r) => sum + (4 - r.available_seats), 0) / totalRides).toFixed(1) : 0;

    return (
        <div className="bg-gray-50 pt-16" style={{ minHeight: 'calc(100vh - 64px)' }}>
            {/* Main Content - Full Width */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Offered Rides</h1>
                    <p className="text-gray-600 mt-2">Manage the rides you've shared with the community.</p>
                </div>

                {/* Booking Requests */}
                {user && <BookingRequests user={user} />}

                {/* Rides List */}
                <div className="space-y-6">
                    {rides.map(ride => {
                        const isUpcoming = new Date(ride.departure_time) > new Date();
                        return (
                            <div key={ride.id} className="card-elevated p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-start md:items-center space-x-4 flex-1">
                                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center border border-orange-200">
                                            <Car className="text-orange-600 w-6 h-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center flex-wrap space-x-2 text-lg font-bold text-gray-900 mb-2">
                                                <MapPin className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                <span>{ride.origin}</span>
                                                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span>{ride.destination}</span>
                                            </div>
                                            <div className="flex items-center flex-wrap space-x-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-1">
                                                    <Clock className={`w-4 h-4 ${isUpcoming ? 'text-green-500' : 'text-red-500'}`} />
                                                    <span className={`font-medium ${isUpcoming ? 'text-green-600' : 'text-red-600'}`}>
                                                        {formatDistanceToNow(new Date(ride.departure_time), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Users className="w-4 h-4" />
                                                    <span className="font-medium">{ride.available_seats} seats</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <IndianRupee className="w-4 h-4" />
                                                    <span className="font-medium">₹{ride.price_per_seat}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center flex-wrap gap-3">
                                        <span className={`badge ${ride.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                                            {ride.status}
                                        </span>
                                        {ride.status === 'active' && (
                                            <>
                                                <button
                                                    onClick={() => setTrackingRide(ride)}
                                                    className="p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    title="Track Live"
                                                >
                                                    <Navigation className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => startEdit(ride)}
                                                    className="p-3 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-100 transition-colors"
                                                    title="Edit Ride"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => deleteRide(ride.id)}
                                                    className="p-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    title="Delete Ride"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => completeRide(ride.id)}
                                                    className="btn-secondary !bg-gray-800 !text-white !border-none px-6 py-3"
                                                >
                                                    Complete
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {rides.length === 0 && (
                        <div className="text-center py-20 card-elevated">
                            <Car className="w-16 h-16 text-gray-300 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No rides offered yet</h3>
                            <p className="text-gray-600">Start sharing your journey with the community!</p>
                        </div>
                    )}
                </div>

                {/* Edit Modal */}
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
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white w-full max-w-2xl rounded-xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto"
                            >
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Ride</h3>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Origin</label>
                                        <input
                                            type="text"
                                            value={formData.origin}
                                            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Destination</label>
                                        <input
                                            type="text"
                                            value={formData.destination}
                                            onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-900 mb-2">Departure Time</label>
                                        <input
                                            type="datetime-local"
                                            value={formData.departure_time}
                                            onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                                            className="input-field"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Available Seats</label>
                                            <input
                                                type="number"
                                                min="1"
                                                max="8"
                                                value={formData.available_seats}
                                                onChange={(e) => setFormData({ ...formData, available_seats: parseInt(e.target.value) })}
                                                className="input-field"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-900 mb-2">Price per Seat (₹)</label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.price_per_seat}
                                                onChange={(e) => setFormData({ ...formData, price_per_seat: parseInt(e.target.value) })}
                                                className="input-field"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                                    <button
                                        onClick={saveEdit}
                                        className="btn-primary flex-1 py-3"
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        onClick={() => setEditingRide(null)}
                                        className="btn-secondary flex-1 py-3"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Live Tracking Modal */}
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
        </div>
    );
};