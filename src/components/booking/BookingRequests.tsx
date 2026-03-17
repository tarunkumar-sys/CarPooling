import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, User, TrendingDown } from 'lucide-react';
import { User as UserType } from '../../types';

export const BookingRequests = ({ user }: { user: UserType }) => {
    const [requests, setRequests] = useState<any[]>([]);

    const fetchRequests = () => {
        fetch(`/api/bookings/driver/${user.id}`)
            .then(res => res.json())
            .then(setRequests);
    };

    useEffect(() => {
        fetchRequests();
        const interval = setInterval(fetchRequests, 5000);
        return () => clearInterval(interval);
    }, [user.id]);

    const handleAction = async (id: number, action: 'accept' | 'reject') => {
        const res = await fetch(`/api/bookings/${action}/${id}`, { method: 'POST' });
        if (res.ok) fetchRequests();
    };

    if (requests.length === 0) return null;

    return (
        <div className="mb-16 space-y-6">
            <h3 className="text-2xl font-display font-black flex items-center gap-3">
                <Users className="text-primary w-8 h-8" /> Pending Requests
            </h3>
            <div className="grid gap-6">
                {requests.map(req => {
                    const hasCounterOffer = req.counter_offer_price && req.counter_offer_price !== null;
                    const originalPrice = req.price_per_seat || 0;
                    const offerPrice = req.counter_offer_price || originalPrice;
                    const discount = originalPrice - offerPrice;
                    
                    return (
                        <motion.div
                            key={req.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`bg-white p-6 rounded-lg border-2 shadow-sm hover:shadow-md transition-all ${
                                hasCounterOffer 
                                    ? 'border-orange-200' 
                                    : 'border-primary/10'
                            }`}
                        >
                            <div className="flex flex-col lg:flex-row justify-between gap-6">
                                <div className="flex items-start gap-4 flex-1">
                                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 flex-shrink-0">
                                        <User className="text-primary w-6 h-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xl font-bold text-ink mb-2">{req.passenger_name}</h4>
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-full">
                                                {req.passenger_gender || 'Male'}
                                            </span>
                                            <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
                                                {req.seats_booked} {req.seats_booked === 1 ? 'Seat' : 'Seats'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium mb-2">
                                            Route: <span className="text-ink font-bold">{req.origin} → {req.destination}</span>
                                        </p>
                                        {req.passenger_phone && (
                                            <p className="text-xs text-slate-400 font-medium">
                                                Phone: <a href={`tel:${req.passenger_phone}`} className="text-primary font-bold hover:underline">{req.passenger_phone}</a>
                                            </p>
                                        )}
                                        
                                        {/* Price Information */}
                                        <div className="mt-4 p-4 bg-slate-50 rounded-lg">
                                            {hasCounterOffer ? (
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <TrendingDown className="w-5 h-5 text-orange-500" />
                                                        <span className="text-xs font-black text-orange-600 uppercase tracking-wider">Counter Offer Received</span>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-wider mb-1">Your Price</p>
                                                            <p className="text-lg font-display font-black text-slate-400 line-through">₹{originalPrice}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] text-orange-600 font-black uppercase tracking-wider mb-1">Passenger Offer</p>
                                                            <p className="text-2xl font-display font-black text-orange-600">₹{offerPrice}</p>
                                                        </div>
                                                    </div>
                                                    <div className="pt-3 border-t border-slate-200">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-bold text-slate-600">Difference</span>
                                                            <span className="text-sm font-black text-red-600">-₹{discount}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between mt-1">
                                                            <span className="text-xs font-bold text-slate-600">Total if accepted</span>
                                                            <span className="text-lg font-black text-orange-600">₹{offerPrice * req.seats_booked}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-slate-600">Price per Seat</span>
                                                    <span className="text-2xl font-display font-black text-primary">₹{originalPrice}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                                    {hasCounterOffer && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-2">
                                            <p className="text-xs font-black text-orange-800 text-center">
                                                Accept counter offer of ₹{offerPrice}?
                                            </p>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => handleAction(req.id, 'accept')}
                                        className={`text-white px-6 py-3 rounded-lg font-bold transition-all shadow-sm ${
                                            hasCounterOffer 
                                                ? 'bg-orange-500 hover:bg-orange-600' 
                                                : 'bg-primary hover:bg-primary-dark'
                                        }`}
                                    >
                                        {hasCounterOffer ? `Accept ₹${offerPrice}` : 'Accept'}
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        className="bg-white text-slate-400 border border-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-slate-50 transition-all"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};
