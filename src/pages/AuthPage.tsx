import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Car, Shield, Navigation, Users, User, Mail, Lock, Phone, House } from 'lucide-react';
import { User as UserType } from '../types';

export const AuthPage = ({ onLogin }: { onLogin: (u: UserType) => void }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        gender: 'male'
    });
    const navigate = useNavigate();

    const handleLoginSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (res.ok) {
            onLogin(data);
            navigate(data.role === 'admin' ? '/admin' : '/');
        } else {
            setError(data.error);
        }
    };

    const handleRegisterSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if (res.ok) {
            setIsLogin(true);
        } else {
            const data = await res.json();
            setError(data.error);
        }
    };

    const toggleAuth = () => {
        setIsLogin(!isLogin);
        setError('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Link to="/" className="fixed top-6 left-6 z-50 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <House className="w-4 h-4" />
                <span className="text-sm font-medium">Back Home</span>
            </Link>

            <div className="w-full max-w-6xl bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex">
                {/* Info Panel */}
                <div className="hidden lg:flex lg:w-1/2 bg-blue-50 p-12 flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login-info"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-8">
                                    <Car className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                        Agra<span className="text-orange-600">Ride</span>
                                    </h1>
                                    <p className="text-gray-600 leading-relaxed">
                                        The premium carpooling ecosystem for Agra's daily commuters.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-gray-700">
                                        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                            <Car className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="font-medium">Split Fuel Costs</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-700">
                                        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                            <Shield className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="font-medium">Verified Commuters Only</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-gray-700">
                                        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center">
                                            <Navigation className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <span className="font-medium">Shared Doorstep Pickups</span>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-16 bg-orange-600 rounded-lg flex items-center justify-center mb-8">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-3">
                                        Join <span className="text-orange-600">AgraRide</span>
                                    </h1>
                                    <p className="text-gray-600 leading-relaxed">
                                        Reduce Agra's traffic congestion while saving your daily travel expenses.
                                    </p>
                                </div>
                                <div className="bg-white rounded-lg p-6 space-y-3">
                                    <p className="text-gray-900 font-semibold text-sm">Why Carpool?</p>
                                    <ul className="space-y-2 text-sm text-gray-600">
                                        <li className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                                            <span>Save up to 60% on Monthly Fuel</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                                            <span>Reduce City CO2 Emissions</span>
                                        </li>
                                        <li className="flex items-start space-x-2">
                                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
                                            <span>Network with Like-minded People</span>
                                        </li>
                                    </ul>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Form Panel */}
                <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {isLogin ? (
                            <motion.div
                                key="login-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-sm mx-auto space-y-6"
                            >
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900">Sign In</h2>
                                    <p className="text-gray-600 mt-2">Log in to your sharing ecosystem.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleLoginSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                placeholder="you@email.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="password"
                                                required
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="flex items-center space-x-2">
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            <span className="text-sm text-gray-600">Keep me logged in</span>
                                        </label>
                                        <button type="button" className="text-sm text-orange-600 hover:text-orange-700">Support?</button>
                                    </div>
                                    <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                                        Enter Workspace
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-gray-600 text-sm">
                                        New here? <button onClick={toggleAuth} className="text-orange-600 hover:text-orange-700 font-semibold">Register.</button>
                                    </p>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="register-form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-full max-w-sm mx-auto space-y-6"
                            >
                                <div className="text-center lg:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900">Create Account</h2>
                                    <p className="text-gray-600 mt-2">Join the premium community today.</p>
                                </div>

                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    required
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                                            <select
                                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                value={formData.gender}
                                                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                            >
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="you@example.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                required
                                                type="tel"
                                                maxLength={10}
                                                value={formData.phone}
                                                onChange={e => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 10) {
                                                        setFormData({ ...formData, phone: val });
                                                    }
                                                }}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="10-digit mobile number"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="password"
                                                required
                                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                    <button className="w-full bg-orange-600 text-white py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold">
                                        Create Account
                                    </button>
                                </form>

                                <div className="text-center">
                                    <p className="text-gray-600 text-sm">
                                        Already have an account? <button onClick={toggleAuth} className="text-orange-600 hover:text-orange-700 font-semibold">Sign In</button>
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};