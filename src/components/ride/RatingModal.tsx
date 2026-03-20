import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { User as UserType } from '../../types';
import { StarRating } from './StarRating';

export const RatingModal = ({ ride, currentUser, onClose }: { ride: any, currentUser: UserType, onClose: () => void }) => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [hasRated, setHasRated] = useState(false);
    const [existingRating, setExistingRating] = useState<any>(null);
    const [checking, setChecking] = useState(true);

    // Check if user has already rated this ride
    useEffect(() => {
        const checkExistingRating = async () => {
            try {
                const res = await fetch(`/api/ratings/check/${ride.id}/${currentUser.id}/${ride.driver_id}`);
                const data = await res.json();
                if (data.hasRated) {
                    setHasRated(true);
                    setExistingRating(data.rating);
                }
            } catch (err) {
                // Silently handle error
            } finally {
                setChecking(false);
            }
        };
        checkExistingRating();
    }, [ride.id, currentUser.id, ride.driver_id]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (hasRated) {
            alert("You have already rated this ride.");
            onClose();
            return;
        }
        setSubmitting(true);
        const res = await fetch('/api/ratings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ride_id: ride.id,
                rater_id: currentUser.id,
                rated_user_id: ride.driver_id,
                rating,
                comment
            })
        });
        if (res.ok) {
            alert("Thank you for your rating!");
            onClose();
        } else {
            const data = await res.json();
            alert(data.error || "Failed to submit rating. Please try again.");
        }
        setSubmitting(false);
    };

    if (checking) {
        return (
            <div className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg text-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-500">Checking rating status...</p>
                </div>
            </div>
        );
    }

    if (hasRated) {
        return (
            <div className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg"
                >
                    <h3 className="text-2xl font-display font-bold mb-4 text-primary">Already Rated</h3>
                    <p className="text-slate-500 mb-6">You have already rated this ride.</p>
                    
                    {existingRating && (
                        <div className="bg-slate-50 rounded-lg p-4 mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <StarRating rating={existingRating.rating} size="sm" />
                                <span className="font-bold text-slate-700">{existingRating.rating}/5</span>
                            </div>
                            {existingRating.comment && (
                                <p className="text-sm text-slate-600 italic">"{existingRating.comment}"</p>
                            )}
                        </div>
                    )}
                    
                    <button
                        onClick={onClose}
                        className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all"
                    >
                        Close
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 top-16 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg"
            >
                <h3 className="text-2xl font-display font-bold mb-2 text-primary">Rate your journey</h3>
                <p className="text-slate-500 mb-8 text-sm">How was your ride with {ride.driver_name}?</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <StarRating rating={rating} onRate={setRating} size="lg" />
                        <span className="text-lg font-bold text-slate-700">
                            {rating === 5 ? 'Excellent!' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Fair' : 'Poor'}
                        </span>
                    </div>

                    <textarea
                        placeholder="Share your experience (optional)..."
                        className="w-full bg-slate-50 border border-slate-100 rounded-lg p-4 text-sm outline-none focus:ring-2 focus:ring-primary h-32 resize-none"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                    />

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-lg font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                        >
                            Skip
                        </button>
                        <button
                            disabled={submitting}
                            className="flex-1 bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-dark transition-all"
                        >
                            {submitting ? 'Submitting...' : 'Submit Rating'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
