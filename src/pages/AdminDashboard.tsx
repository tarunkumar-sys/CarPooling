import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, AlertCircle, User, Map as MapIcon, Users, Car, ChevronRight, TrendingUp } from 'lucide-react';
import { User as UserType } from '../types';
import { DatabaseManager } from '../components/admin/DatabaseManager';
import { SimulatedMap } from '../components/ride/SimulatedMap';

export const AdminDashboard = ({ user }: { user: UserType | null }) => {
    const [stats, setStats] = useState<any>(null);
    const [allRides, setAllRides] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [filteredRides, setFilteredRides] = useState<any[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [userSearchQuery, setUserSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
    const [selectedRide, setSelectedRide] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'overview' | 'rides' | 'users' | 'database' | 'security'>('overview');
    const navigate = useNavigate();

    const fetchStats = () => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(setStats);
    };

    const fetchAllRides = () => {
        fetch('/api/admin/rides')
            .then(res => res.json())
            .then(data => {
                                setAllRides(data);
                setFilteredRides(data);
            })
            .catch(err => {
                                setAllRides([]);
                setFilteredRides([]);
            });
    };

    const fetchAllUsers = () => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                                setAllUsers(data);
                setFilteredUsers(data);
            })
            .catch(err => {
                                setAllUsers([]);
                setFilteredUsers([]);
            });
    };

    // Filter rides based on search and status
    useEffect(() => {
        let filtered = allRides;

        // Filter by status
        if (statusFilter !== 'all') {
            filtered = filtered.filter(ride => ride.status === statusFilter);
        }

        // Filter by search query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ride => 
                ride.driver_name.toLowerCase().includes(query) ||
                ride.origin.toLowerCase().includes(query) ||
                ride.destination.toLowerCase().includes(query) ||
                ride.id.toString().includes(query)
            );
        }

        setFilteredRides(filtered);
    }, [searchQuery, statusFilter, allRides]);

    // Filter users based on search
    useEffect(() => {
        let filtered = allUsers;

        if (userSearchQuery) {
            const query = userSearchQuery.toLowerCase();
            filtered = filtered.filter(u => 
                u.name.toLowerCase().includes(query) ||
                u.email.toLowerCase().includes(query) ||
                u.phone?.toLowerCase().includes(query) ||
                u.id.toString().includes(query)
            );
        }

        setFilteredUsers(filtered);
    }, [userSearchQuery, allUsers]);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchStats();
        fetchAllRides();
        fetchAllUsers();
        const interval = setInterval(() => {
            fetchStats();
            fetchAllRides();
            fetchAllUsers();
        }, 10000); // Poll for updates
        return () => clearInterval(interval);
    }, [user, navigate]);

    const resolveSOS = async (id: number) => {
        await fetch(`/api/sos/resolve/${id}`, { method: 'POST' });
        fetchStats();
    };

    const deleteRide = async (id: number) => {
        if (!confirm('Are you sure you want to delete this ride? This will also delete all bookings, messages, and ratings for this ride.')) return;
        
        try {
            const res = await fetch(`/api/rides/${id}`, { method: 'DELETE' });
            const data = await res.json();
            
            if (res.ok) {
                alert('Ride deleted successfully');
                fetchAllRides();
                fetchStats();
            } else {
                alert('Failed to delete ride: ' + (data.error || 'Unknown error'));
                            }
        } catch (error) {
            alert('Failed to delete ride: Network error');
                    }
    };

    const completeRide = async (id: number) => {
        if (!confirm('Mark this ride as completed?')) return;
        
        try {
            const res = await fetch(`/api/rides/complete/${id}`, { method: 'POST' });
            const data = await res.json();
            
            if (res.ok) {
                alert('Ride marked as completed');
                fetchAllRides();
                fetchStats();
            } else {
                alert('Failed to complete ride: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Failed to complete ride: Network error');
                    }
    };

    const deleteUser = async (id: number) => {
        if (!confirm('Are you sure you want to delete this user? This will permanently delete:\n• All their rides\n• All their bookings\n• All their messages\n• All their ratings\n• All their locations\n• All their SOS alerts\n\nThis action cannot be undone!')) return;
        
        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            const data = await res.json();
            
            if (res.ok) {
                alert('User deleted successfully');
                fetchAllUsers();
                fetchStats();
            } else {
                alert('Failed to delete user: ' + (data.error || 'Unknown error'));
                            }
        } catch (error) {
            alert('Failed to delete user: Network error');
                    }
    };

    const toggleUserRole = async (userId: number, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        if (!confirm(`Change user role to ${newRole}?`)) return;
        
        const res = await fetch(`/api/admin/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole })
        });
        
        if (res.ok) {
            alert('User role updated successfully');
            fetchAllUsers();
        } else {
            alert('Failed to update user role');
        }
    };

    if (!stats) return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-16 pt-24">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
                <div>
                    <h2 className="text-4xl font-display font-black tracking-tight flex items-center gap-4 text-primary">
                        <Shield className="text-primary w-10 h-10" /> Admin Control
                    </h2>
                    <p className="text-slate-500 mt-2 font-medium">Real-time overview of the AgraRide ecosystem.</p>
                </div>
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-100 shadow-sm">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('rides')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'rides' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Rides
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setActiveTab('security')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Security {stats.activeSOS.length > 0 && <span className="ml-2 bg-white text-red-600 px-2 py-0.5 rounded-full text-[10px]">{stats.activeSOS.length}</span>}
                    </button>
                    <button
                        onClick={() => setActiveTab('database')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'database' ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Database
                    </button>
                </div>
            </div>

            {activeTab === 'rides' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                            <Car className="text-primary" /> All Rides Management
                        </h3>
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder="Search by driver, location, ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as any)}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {filteredRides.length} of {allRides.length} rides
                    </div>
                    
                    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                        <th className="px-6 py-6">ID</th>
                                        <th className="px-6 py-6">Driver</th>
                                        <th className="px-6 py-6">Route</th>
                                        <th className="px-6 py-6">Departure</th>
                                        <th className="px-6 py-6">Seats</th>
                                        <th className="px-6 py-6">Price</th>
                                        <th className="px-6 py-6">Status</th>
                                        <th className="px-6 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRides.map((ride: any) => (
                                        <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6 font-mono text-sm text-slate-500">#{ride.id}</td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-ink text-sm">{ride.driver_name}</p>
                                                        <p className="text-xs text-slate-400">{ride.driver_phone}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2 text-xs font-medium">
                                                    <span className="text-slate-600">{ride.origin}</span>
                                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                                    <span className="text-slate-600">{ride.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-xs text-slate-500 font-medium">
                                                {new Date(ride.departure_time).toLocaleString('en-IN', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-bold text-slate-700">{ride.available_seats}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-sm font-bold text-primary">₹{ride.price_per_seat}</span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`badge text-xs ${
                                                    ride.status === 'active' 
                                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                                                        : 'bg-slate-100 text-slate-500 border-slate-200'
                                                }`}>
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => setSelectedRide(ride)}
                                                        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                        title="Track Live"
                                                    >
                                                        <MapIcon className="w-4 h-4" />
                                                    </button>
                                                    {ride.status === 'active' && (
                                                        <button
                                                            onClick={() => completeRide(ride.id)}
                                                            className="px-3 py-1.5 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                                                            title="Mark Complete"
                                                        >
                                                            Complete
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteRide(ride.id)}
                                                        className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                        title="Delete Ride"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredRides.length === 0 && (
                            <div className="text-center py-20">
                                <Car className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">
                                    {searchQuery || statusFilter !== 'all' ? 'No rides match your filters' : 'No rides found'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="space-y-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                            <Users className="text-primary" /> User Management
                        </h3>
                        <input
                            type="text"
                            placeholder="Search by name, email, phone, ID..."
                            value={userSearchQuery}
                            onChange={(e) => setUserSearchQuery(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-primary"
                        />
                    </div>
                    
                    <div className="text-sm text-slate-500 font-medium">
                        Showing {filteredUsers.length} of {allUsers.length} users
                    </div>
                    
                    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                        <th className="px-6 py-6">ID</th>
                                        <th className="px-6 py-6">Name</th>
                                        <th className="px-6 py-6">Email</th>
                                        <th className="px-6 py-6">Phone</th>
                                        <th className="px-6 py-6">Gender</th>
                                        <th className="px-6 py-6">Vehicle</th>
                                        <th className="px-6 py-6">Role</th>
                                        <th className="px-6 py-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredUsers.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-6 font-mono text-sm text-slate-500">#{u.id}</td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-ink text-sm">{u.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6 text-sm text-slate-600">{u.email}</td>
                                            <td className="px-6 py-6 text-sm text-slate-600">{u.phone || 'N/A'}</td>
                                            <td className="px-6 py-6">
                                                <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                                                    {u.gender || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className="text-xs px-2 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium">
                                                    {u.vehicle_type || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <span className={`badge text-xs ${
                                                    u.role === 'admin' 
                                                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                                                        : 'bg-primary-50 text-primary-600 border-primary-100'
                                                }`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-6">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => toggleUserRole(u.id, u.role)}
                                                        className="px-3 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                                        title={`Change to ${u.role === 'admin' ? 'User' : 'Admin'}`}
                                                    >
                                                        {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                                                    </button>
                                                    {u.id !== user?.id && (
                                                        <button
                                                            onClick={() => deleteUser(u.id)}
                                                            className="px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                            title="Delete User"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredUsers.length === 0 && (
                            <div className="text-center py-20">
                                <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">
                                    {userSearchQuery ? 'No users match your search' : 'No users found'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'security' && (
                <div className="space-y-12">
                    {/* SOS Alerts */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3 text-red-600">
                            <AlertCircle /> Active SOS Alerts
                        </h3>
                        <div className="grid gap-6">
                            {stats.activeSOS.map((sos: any) => (
                                <div key={sos.id} className="bg-red-50 border-2 border-red-100 rounded-lg p-6 flex flex-col md:flex-row justify-between items-center gap-6 animate-pulse">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-red-600 text-white p-3 rounded-lg">
                                                <User />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-red-400 uppercase tracking-widest">Alert Triggered By</p>
                                                <h4 className="text-xl font-bold text-red-900">{sos.user_name}</h4>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Driver</p>
                                                <p className="font-bold text-red-900">{sos.driver_name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Passengers</p>
                                                <p className="font-bold text-red-900">{sos.passengers || 'None'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setSelectedRide({ id: sos.ride_id, origin: sos.origin, destination: sos.destination, driver_name: sos.driver_name, driver_id: sos.driver_id })}
                                            className="bg-red-600 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-all"
                                        >
                                            <MapIcon className="w-5 h-5" /> Track Live
                                        </button>
                                        <button
                                            onClick={() => resolveSOS(sos.id)}
                                            className="bg-white text-red-600 border border-red-200 px-6 py-3 rounded-lg font-bold hover:bg-red-100 transition-all"
                                        >
                                            Resolve
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {stats.activeSOS.length === 0 && (
                                <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-200">
                                    <Shield className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-medium">No active SOS alerts. System secure.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detailed Bookings (Who with whom) */}
                    <div className="space-y-6">
                        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                            <Users /> Passenger-Driver Pairings
                        </h3>
                        <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                            <th className="px-8 py-6">Passenger</th>
                                            <th className="px-8 py-6">With Driver</th>
                                            <th className="px-8 py-6">Route</th>
                                            <th className="px-8 py-6">Status</th>
                                            <th className="px-8 py-6 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {stats.detailedBookings.map((b: any) => (
                                            <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-6 font-bold text-ink">{b.passenger_name}</td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Car className="w-4 h-4 text-primary" />
                                                        <span className="font-bold text-slate-700">{b.driver_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2 text-sm font-medium">
                                                        <span className="text-slate-400">{b.origin}</span>
                                                        <ChevronRight className="w-3 h-3 text-slate-300" />
                                                        <span className="text-slate-400">{b.destination}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <span className={`badge ${b.ride_status === 'active' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        {b.ride_status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-6 text-right">
                                                    <button
                                                        onClick={() => setSelectedRide({ id: b.ride_id, origin: b.origin, destination: b.destination, driver_name: b.driver_name })}
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                    >
                                                        <MapIcon className="w-5 h-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'overview' && (
                <>
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        {[
                            { label: 'Total Users', value: stats.users, icon: User, color: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
                            { label: 'Active Rides', value: stats.rides, icon: Car, color: 'bg-primary-50 text-primary-600', border: 'border-primary-100' },
                            { label: 'Total Bookings', value: stats.bookings, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100' }
                        ].map((s, i) => (
                            <div key={i} className={`bg-white p-8 rounded-lg border ${s.border} shadow-sm hover:shadow-md transition-all relative overflow-hidden group`}>
                                <div className={`${s.color} w-14 h-14 rounded-lg flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}>
                                    <s.icon className="w-7 h-7" />
                                </div>
                                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">{s.label}</p>
                                <h3 className="text-4xl font-display font-black mt-2 tracking-tighter text-primary">{s.value}</h3>
                                <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
                                    <s.icon className="w-24 h-24" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-lg border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                            <h3 className="text-2xl font-display font-bold text-primary">Recent Ride Activity</h3>
                            <button className="btn-secondary !py-2 !px-6 !text-xs !uppercase !tracking-widest">View All Logs</button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-50">
                                        <th className="px-8 py-6">Driver</th>
                                        <th className="px-8 py-6">Route Path</th>
                                        <th className="px-8 py-6">Departure</th>
                                        <th className="px-8 py-6">Status</th>
                                        <th className="px-8 py-6 text-right">Monitoring</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {stats.recentRides.map((ride: any) => (
                                        <tr key={ride.id} className="hover:bg-slate-50/50 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 group-hover:bg-white transition-colors">
                                                        <User className="w-5 h-5 text-slate-400" />
                                                    </div>
                                                    <span className="font-bold text-ink">{ride.driver_name}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3 text-sm font-medium">
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{ride.origin}</span>
                                                    <ChevronRight className="w-3 h-3 text-slate-300" />
                                                    <span className="bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{ride.destination}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                                                {new Date(ride.departure_time).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="badge bg-emerald-50 text-emerald-600 border border-emerald-100">
                                                    {ride.status}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button
                                                    onClick={() => setSelectedRide(ride)}
                                                    className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-100 hover:bg-primary hover:text-white hover:border-primary transition-all mx-auto md:ml-auto md:mr-0"
                                                >
                                                    <MapIcon className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'database' && (
                <DatabaseManager />
            )}

            <AnimatePresence>
                {selectedRide && (
                    <SimulatedMap
                        ride={selectedRide}
                        currentUser={user}
                        onClose={() => setSelectedRide(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
