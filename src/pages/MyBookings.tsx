import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Navigation, ChevronRight } from 'lucide-react';
import { User as UserType } from '../types';
import { RatingModal } from '../components/ride/RatingModal';
import { GoogleMap } from '../components/ride/GoogleMap';

export const MyBookings = ({ user }: { user: UserType | null }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [ratingRide, setRatingRide] = useState<any>(null);
    const [trackingRide, setTrackingRide] = useState<any>(null);

    useEffect(() => {
        if (!user) return;
        fetch(`/api/bookings/passenger/${user.id}`)
            .then(res => res.json())
            .then(setBookings);
    }, [user]);

    if (!user) return <Navigate to="/login" />;

    return (
        <div className="max-w-5xl mx-auto px-4 py-16 pt-24">
            <div className="mb-12">
                <h2 className="text-4xl font-display font-black tracking-tight text-primary">My Bookings</h2>
                <p className="text-slate-500 mt-2 font-medium">Keep track of your upcoming and past journeys.</p>
            </div>

            <div className="grid gap-6">
                {bookings.map(booking => (
                    <div key={booking.id} className="bg-white p-6 rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-primary/20 transition-colors">
                                <Navigation className="text-primary w-5 h-5" />
                            </div>
                            <div>
                                <div className="flex items-center gap-3 text-lg font-display font-bold text-ink mb-1">
                                    <span>{booking.origin}</span>
                                    <ChevronRight className="w-4 h-4 text-slate-300" />
                                    <span>{booking.destination}</span>
                                </div>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                    Driver: <span className="text-ink">{booking.driver_name}</span> • {new Date(booking.departure_time).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end gap-2">
                                <span className={`badge ${booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        booking.status === 'rejected' ? 'bg-red-50 text-red-600 border border-red-100' :
                                            'bg-orange-50 text-orange-600 border border-orange-100'
                                    }`}>
                                    {booking.status.toUpperCase()}
                                </span>
                                <span className={`badge ${booking.ride_status === 'active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-500 border border-slate-200'
                                    }`}>
                                    Ride: {booking.ride_status}
                                </span>
                            </div>
                            {booking.status === 'confirmed' && booking.ride_status === 'active' && (
                                <button
                                    onClick={() => setTrackingRide({
                                        id: booking.ride_id,
                                        driver_id: booking.driver_id,
                                        driver_name: booking.driver_name,
                                        origin: booking.origin,
                                        destination: booking.destination
                                    })}
                                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 hover:bg-primary-dark transition-all"
                                >
                                    <Navigation className="w-4 h-4" /> Track Live
                                </button>
                            )}
                            {booking.ride_status === 'completed' && booking.status === 'confirmed' && (
                                <button
                                    onClick={() => setRatingRide({ id: booking.ride_id, driver_id: booking.driver_id, driver_name: booking.driver_name })}
                                    className="btn-primary text-sm"
                                >
                                    Rate Ride
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                {bookings.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-200">
                        <Navigation className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No bookings yet</p>
                    </div>
                )}
            </div>

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
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
