import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserType } from '../../types';
import { AnimatedLogo } from './AnimatedLogo';

export const Navbar = ({ user, onLogout }: { user: UserType | null, onLogout: () => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        onLogout();
        navigate('/');
    };

    // Helper function to check if a path is active
    const isActivePath = (path: string) => {
        return location.pathname === path;
    };

    // Helper function to get active link classes
    const getLinkClasses = (path: string, baseClasses: string = "text-gray-600 hover:text-orange-600 font-medium text-sm transition-colors") => {
        if (isActivePath(path)) {
            return `${baseClasses.replace('text-gray-600', 'text-orange-600')} relative`;
        }
        return baseClasses;
    };

    // Helper function to get mobile link classes
    const getMobileLinkClasses = (path: string) => {
        if (isActivePath(path)) {
            return "block text-orange-600 font-semibold py-2 bg-orange-50 px-3 rounded-lg border-l-4 border-orange-600";
        }
        return "block text-gray-600 hover:text-orange-600 font-medium py-2";
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
                <div className="flex justify-between h-14 sm:h-16">
                    <div className="flex items-center relative">
                        <div className={`transition-all duration-300 ${isActivePath('/') ? 'scale-105' : ''}`}>
                            <AnimatedLogo />
                        </div>
                        {isActivePath('/') && (
                            <motion.div
                                layoutId="homeIndicator"
                                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-orange-600 rounded-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user?.role === 'admin' ? (
                            <>
                                <Link to="/admin" className={`${getLinkClasses('/admin')} flex items-center space-x-1`}>
                                    <Shield className="w-4 h-4" />
                                    <span>Admin Dashboard</span>
                                    {isActivePath('/admin') && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                                <Link to="/inbox" className={`${getLinkClasses('/inbox')} flex items-center space-x-1`}>
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Inbox</span>
                                    {isActivePath('/inbox') && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/search" className={getLinkClasses('/search')}>
                                    Find a Ride
                                    {isActivePath('/search') && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                                <Link to="/offer" className={getLinkClasses('/offer')}>
                                    Offer a Ride
                                    {isActivePath('/offer') && (
                                        <motion.div
                                            layoutId="activeIndicator"
                                            className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                            initial={false}
                                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                        />
                                    )}
                                </Link>
                                {user && (
                                    <>
                                        <Link to="/my-rides" className={getLinkClasses('/my-rides')}>
                                            My Rides
                                            {isActivePath('/my-rides') && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                        <Link to="/my-bookings" className={getLinkClasses('/my-bookings')}>
                                            My Bookings
                                            {isActivePath('/my-bookings') && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                        <Link to="/inbox" className={`${getLinkClasses('/inbox')} flex items-center space-x-1`}>
                                            <MessageSquare className="w-4 h-4" />
                                            <span>Inbox</span>
                                            {isActivePath('/inbox') && (
                                                <motion.div
                                                    layoutId="activeIndicator"
                                                    className="absolute -bottom-4 left-0 right-0 h-0.5 bg-orange-600 rounded-full"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                />
                                            )}
                                        </Link>
                                    </>
                                )}
                            </>
                        )}
                        {user ? (
                            <div className="flex items-center space-x-3 pl-6 border-l border-gray-200">
                                <Link to="/profile" className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                                    isActivePath('/profile') 
                                        ? 'text-orange-600 bg-orange-50 border border-orange-200' 
                                        : 'text-gray-900 bg-gray-100 hover:bg-gray-200'
                                }`}>
                                    <User className="w-4 h-4 text-orange-600" />
                                    <span className="font-semibold text-sm">{user.name}</span>
                                </Link>
                                <button
                                    onClick={handleLogout}
                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Logout"
                                >
                                    <LogOut className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold"
                            >
                                Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 transition-colors">
                            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="md:hidden bg-white border-b border-gray-200 px-4 pt-2 pb-6 space-y-3"
                    >
                        <Link to="/" className={getMobileLinkClasses('/')} onClick={() => setIsOpen(false)}>Home</Link>
                        <Link to="/search" className={getMobileLinkClasses('/search')} onClick={() => setIsOpen(false)}>Find a Ride</Link>
                        <Link to="/offer" className={getMobileLinkClasses('/offer')} onClick={() => setIsOpen(false)}>Offer a Ride</Link>
                        {user && (
                            <>
                                <Link to="/my-rides" className={getMobileLinkClasses('/my-rides')} onClick={() => setIsOpen(false)}>My Rides</Link>
                                <Link to="/my-bookings" className={getMobileLinkClasses('/my-bookings')} onClick={() => setIsOpen(false)}>My Bookings</Link>
                                <Link to="/inbox" className={getMobileLinkClasses('/inbox')} onClick={() => setIsOpen(false)}>Inbox</Link>
                                <Link to="/profile" className={getMobileLinkClasses('/profile')} onClick={() => setIsOpen(false)}>Profile</Link>
                            </>
                        )}
                        {user?.role === 'admin' && <Link to="/admin" className={getMobileLinkClasses('/admin')} onClick={() => setIsOpen(false)}>Admin Dashboard</Link>}
                        {user ? (
                            <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full text-left text-red-500 font-medium py-2">Logout</button>
                        ) : (
                            <Link to="/login" className="block bg-orange-600 text-white text-center py-3 rounded-lg font-semibold" onClick={() => setIsOpen(false)}>Login</Link>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};