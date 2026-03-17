import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { User as UserIcon, Phone, Mail, Car, Star, Award, TrendingUp, Shield, Edit2, Save, X } from 'lucide-react';
import { User as UserType } from '../types';
import { StarRating } from '../components/ride/StarRating';

export const Profile = ({ user }: { user: UserType | null }) => {
    const [ratings, setRatings] = useState<any[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [stats, setStats] = useState({ totalRides: 0, completedRides: 0, totalBookings: 0 });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        gender: '',
        vehicle_type: '',
        password: ''
    });
    const [showPasswordField, setShowPasswordField] = useState(false);
    const [updateMessage, setUpdateMessage] = useState('');
    const [updateError, setUpdateError] = useState('');

    useEffect(() => {
        if (!user) return;

        // Initialize form with user data
        setEditForm({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            gender: user.gender || '',
            vehicle_type: user.vehicle_type || '',
            password: ''
        });

        // Fetch ratings
        fetch(`/api/ratings/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setRatings(data.ratings || []);
                setAvgRating(data.average || 0);
            });

        // Fetch user stats
        Promise.all([
            fetch(`/api/rides/driver/${user.id}`).then(r => r.json()),
            fetch(`/api/bookings/passenger/${user.id}`).then(r => r.json())
        ]).then(([rides, bookings]) => {
            setStats({
                totalRides: rides.length,
                completedRides: rides.filter((r: any) => r.status === 'completed').length,
                totalBookings: bookings.length
            });
        });
    }, [user]);

    const handleEditToggle = () => {
        if (isEditing) {
            // Cancel editing - reset form
            setEditForm({
                name: user?.name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                gender: user?.gender || '',
                vehicle_type: user?.vehicle_type || '',
                password: ''
            });
            setShowPasswordField(false);
        }
        setIsEditing(!isEditing);
        setUpdateMessage('');
        setUpdateError('');
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setUpdateMessage('');
        setUpdateError('');

        try {
            // Prepare update data (only include changed fields)
            const updateData: any = {};
            
            if (editForm.name.trim() !== user.name) updateData.name = editForm.name.trim();
            if (editForm.email.trim() !== user.email) updateData.email = editForm.email.trim();
            if (editForm.phone.trim() !== (user.phone || '')) updateData.phone = editForm.phone.trim();
            if (editForm.gender !== (user.gender || '')) updateData.gender = editForm.gender;
            if (editForm.vehicle_type !== (user.vehicle_type || '')) updateData.vehicle_type = editForm.vehicle_type;
            if (showPasswordField && editForm.password.trim()) updateData.password = editForm.password.trim();

                        
            if (Object.keys(updateData).length === 0) {
                setUpdateError('No changes to save');
                return;
            }

            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(updateData)
            });

                        
            if (!res.ok) {
                // Try to get error message from response
                let errorMessage = 'Failed to update profile';
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.error || errorMessage;
                } catch (jsonError) {
                                        if (res.status === 404) {
                        errorMessage = 'User not found. Please try logging in again.';
                    } else if (res.status === 400) {
                        errorMessage = 'Invalid data provided';
                    } else if (res.status >= 500) {
                        errorMessage = 'Server error. Please try again later.';
                    }
                }
                setUpdateError(errorMessage);
                return;
            }

            const data = await res.json();
            
            // Update localStorage with new user data
            const updatedUser = { ...user, ...data };
            localStorage.setItem('agraride_user', JSON.stringify(updatedUser));
            
            setUpdateMessage('Changes saved');
            setIsEditing(false);
            setShowPasswordField(false);
            
            // Reload page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (error) {
                        setUpdateError('Network error. Please check your connection and try again.');
        }
    };

    if (!user) return <Navigate to="/login" />;

    const successRate = stats.totalRides > 0 ? Math.round((stats.completedRides / stats.totalRides) * 100) : 0;

    return (
        <div className="min-h-screen bg-paper pt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-display font-bold text-ink">Profile</h1>
                    <p className="text-gray-600 mt-2 font-medium">Manage your account settings and preferences</p>
                </div>

                {/* Success/Error Messages */}
                {updateMessage && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-medium">
                        {updateMessage}
                    </div>
                )}
                {updateError && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-medium">
                        {updateError}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                    {/* Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 relative">
                            {/* Edit Button */}
                            <button
                                onClick={handleEditToggle}
                                className={`absolute top-4 right-4 p-2 rounded-lg transition-colors ${
                                    isEditing 
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                }`}
                                title={isEditing ? 'Cancel Edit' : 'Edit Profile'}
                            >
                                {isEditing ? (
                                    <X className="w-4 h-4" />
                                ) : (
                                    <Edit2 className="w-4 h-4" />
                                )}
                            </button>

                            <div className="text-center">
                                {/* Avatar */}
                                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                                    <UserIcon className="w-10 h-10 text-white" />
                                </div>
                                
                                {/* Name */}
                                {isEditing ? (
                                    <div className="mb-4">
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h2>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-orange-100 text-orange-800 mb-4">
                                            {user.role === 'admin' ? 'Administrator' : 'Member'}
                                        </span>
                                    </>
                                )}
                            </div>

                            {/* Profile Details */}
                            <div className="space-y-4 mt-6">
                                {/* Email */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                        <Mail className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</p>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                value={editForm.email}
                                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            />
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-900 truncate">{user.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Phone */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                        <Phone className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</p>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                value={editForm.phone}
                                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                placeholder="+91 9876543210"
                                            />
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-900">{user.phone || 'Not provided'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Gender */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                        <UserIcon className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Gender</p>
                                        {isEditing ? (
                                            <select
                                                value={editForm.gender}
                                                onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            >
                                                <option value="">Select Gender</option>
                                                <option value="male">Male</option>
                                                <option value="female">Female</option>
                                                <option value="other">Other</option>
                                            </select>
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-900 capitalize">{user.gender || 'Not specified'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Vehicle Type */}
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center">
                                        <Car className="w-4 h-4 text-gray-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</p>
                                        {isEditing ? (
                                            <select
                                                value={editForm.vehicle_type}
                                                onChange={(e) => setEditForm({ ...editForm, vehicle_type: e.target.value })}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                            >
                                                <option value="">No Vehicle</option>
                                                <option value="bike">Bike</option>
                                                <option value="scooter">Scooter</option>
                                                <option value="4-wheeler">4-Wheeler</option>
                                            </select>
                                        ) : (
                                            <p className="mt-1 text-sm text-gray-900">{user.vehicle_type || 'None'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Password (only in edit mode) */}
                                {isEditing && (
                                    <div className="pt-4 border-t border-gray-200">
                                        {!showPasswordField ? (
                                            <button
                                                onClick={() => setShowPasswordField(true)}
                                                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                Change Password
                                            </button>
                                        ) : (
                                            <div className="space-y-3">
                                                <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">New Password</p>
                                                <input
                                                    type="password"
                                                    value={editForm.password}
                                                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                                                    placeholder="Enter new password"
                                                />
                                                <button
                                                    onClick={() => {
                                                        setShowPasswordField(false);
                                                        setEditForm({ ...editForm, password: '' });
                                                    }}
                                                    className="text-xs text-gray-500 hover:text-gray-700"
                                                >
                                                    Cancel password change
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Save Button */}
                            {isEditing && (
                                <div className="mt-6">
                                    <button
                                        onClick={handleSaveProfile}
                                        className="w-full bg-orange-600 text-white px-4 py-2.5 rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors flex items-center justify-center space-x-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        <span>Save</span>
                                    </button>
                                </div>
                            )}

                            {/* Rating Display */}
                            {avgRating > 0 && !isEditing && (
                                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                                    <div className="flex items-center justify-center space-x-2 mb-2">
                                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                        <span className="text-2xl font-semibold text-gray-900">{avgRating.toFixed(1)}</span>
                                    </div>
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Rating</p>
                                    <div className="flex items-center justify-center space-x-1 mt-2">
                                        <StarRating rating={avgRating} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Stats & Activity */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-md flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total Rides</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.totalRides}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-md flex items-center justify-center">
                                        <Award className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Completed</p>
                                        <p className="text-2xl font-semibold text-gray-900">{stats.completedRides}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-md flex items-center justify-center">
                                        <Shield className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Success Rate</p>
                                        <p className="text-2xl font-semibold text-gray-900">{successRate}%</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Overview */}
                        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                                    <Car className="w-4 h-4 text-blue-600" />
                                </div>
                                <span>Activity Overview</span>
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="bg-gray-50 rounded-md p-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Bookings</p>
                                    <p className="text-3xl font-semibold text-gray-900">{stats.totalBookings}</p>
                                </div>
                                <div className="bg-gray-50 rounded-md p-4">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Rides Offered</p>
                                    <p className="text-3xl font-semibold text-gray-900">{stats.totalRides}</p>
                                </div>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        {ratings.length > 0 ? (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                                    <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                                        <Star className="w-4 h-4 text-yellow-600" />
                                    </div>
                                    <span>Recent Reviews</span>
                                </h3>
                                <div className="space-y-4">
                                    {ratings.slice(0, 5).map((rating: any) => (
                                        <div key={rating.id} className="bg-gray-50 rounded-md p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{rating.rater_name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(rating.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <StarRating rating={rating.rating} />
                                                </div>
                                            </div>
                                            {rating.comment && (
                                                <p className="text-sm text-gray-600 italic">"{rating.comment}"</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-12 text-center">
                                <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 font-medium">No reviews yet</p>
                                <p className="text-gray-400 text-sm mt-2">Complete rides to receive ratings from other users</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
