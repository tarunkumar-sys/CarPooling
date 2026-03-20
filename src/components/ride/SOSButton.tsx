/**
 * SOS Emergency Button Component
 * 
 * Provides emergency alert functionality during active rides.
 * Features:
 * - One-click emergency alert
 * - Confirmation dialog to prevent accidental triggers
 * - Visual feedback and status updates
 * - Automatic location sharing with alert
 * - Integration with admin dashboard for monitoring
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Phone, Shield, X, MapPin, Clock } from 'lucide-react';
import { User as UserType } from '../../types';

interface SOSButtonProps {
    rideId: number;
    currentUser: UserType;
    onSOSTriggered?: () => void;
}

export const SOSButton = ({ rideId, currentUser, onSOSTriggered }: SOSButtonProps) => {
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [isTriggering, setIsTriggering] = useState(false);
    const [isTriggered, setIsTriggered] = useState(false);

    const triggerSOS = async () => {
        setIsTriggering(true);
        
        try {
            // Get current location if available
            let currentLocation = null;
            if (navigator.geolocation) {
                try {
                    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                        navigator.geolocation.getCurrentPosition(resolve, reject, {
                            enableHighAccuracy: true,
                            timeout: 5000,
                            maximumAge: 60000
                        });
                    });
                    currentLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    };
                } catch (error) {
                    console.warn('Could not get current location for SOS:', error);
                }
            }

            const response = await fetch('/api/sos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ride_id: rideId,
                    user_id: currentUser.id,
                    location: currentLocation,
                    timestamp: new Date().toISOString()
                }),
            });

            if (response.ok) {
                setIsTriggered(true);
                setShowConfirmation(false);
                onSOSTriggered?.();
                
                // Show success message
                alert('Emergency alert sent successfully! Authorities have been notified.');
            } else {
                const error = await response.json();
                alert('Failed to send emergency alert: ' + (error.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('SOS trigger error:', error);
            alert('Failed to send emergency alert. Please try again or call emergency services directly.');
        } finally {
            setIsTriggering(false);
        }
    };

    if (isTriggered) {
        return (
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center"
            >
                <div className="flex items-center justify-center mb-2">
                    <Shield className="w-6 h-6 text-red-600 mr-2" />
                    <span className="text-red-800 font-bold text-sm">Emergency Alert Active</span>
                </div>
                <p className="text-red-700 text-xs">
                    Authorities have been notified. Help is on the way.
                </p>
                <div className="flex items-center justify-center mt-2 text-xs text-red-600">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>Alert sent at {new Date().toLocaleTimeString()}</span>
                </div>
            </motion.div>
        );
    }

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowConfirmation(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all duration-200 border-2 border-red-700"
                disabled={isTriggering}
            >
                <AlertTriangle className="w-5 h-5" />
                <span>SOS Emergency</span>
            </motion.button>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {showConfirmation && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
                        >
                            <div className="text-center mb-6">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Emergency Alert Confirmation
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    This will immediately notify authorities and the admin team about your emergency situation. 
                                    Your current location will be shared for assistance.
                                </p>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-red-800 font-semibold text-sm mb-1">
                                            What happens next:
                                        </p>
                                        <ul className="text-red-700 text-xs space-y-1">
                                            <li>• Admin team will be notified immediately</li>
                                            <li>• Your location will be tracked in real-time</li>
                                            <li>• Emergency contacts may be notified</li>
                                            <li>• Ride details will be flagged for priority response</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <Phone className="w-4 h-4 text-blue-600" />
                                    <span className="text-blue-800 font-semibold text-sm">Emergency Numbers</span>
                                </div>
                                <div className="text-blue-700 text-xs space-y-1">
                                    <p>Police: <strong>100</strong> | Ambulance: <strong>108</strong></p>
                                    <p>Women Helpline: <strong>1091</strong> | Fire: <strong>101</strong></p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmation(false)}
                                    className="flex-1 py-3 px-4 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors border border-gray-200"
                                    disabled={isTriggering}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={triggerSOS}
                                    disabled={isTriggering}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isTriggering ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Sending Alert...</span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Send Emergency Alert</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default SOSButton;