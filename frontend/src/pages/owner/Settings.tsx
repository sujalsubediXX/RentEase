import { useState, useEffect } from "react";
import { Avatar } from "../../components/owner/Avatar";
import { Stars } from "../../components/owner/Stars";
import { Edit, Save, X } from "lucide-react";
import { TopBar } from "../../components/owner/TopBar";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import axios from "axios";
import API_BASE_URL from "../../config/api";

interface NotificationSettings {
    bookingReq: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    promos: boolean;
}

interface UserSettings {
    fullName: string;
    phoneNumber: string;
    address: string;
    profileImage: string;
}

export const Settings = () => {
    const { user, updateUser } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form state
    const [formData, setFormData] = useState<UserSettings>({
        fullName: '',
        phoneNumber: '',
        address: '',
        profileImage: ''
    });

    // Notification settings
    const [notif, setNotif] = useState<NotificationSettings>({
        bookingReq: true,
        messages: true,
        reviews: true,
        payments: true,
        promos: false,
    });

    // Load user data
    useEffect(() => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                profileImage: user.profileImage || ''
            });
        }
    }, [user]);

    const toggleNotif = (key: keyof NotificationSettings) => {
        setNotif(n => ({ ...n, [key]: !n[key] }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            setMessage(null);

            const token = authService.getAccessToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            if (!user?.id) {
                throw new Error('User ID not found');
            }

            // Update user profile
            const response = await axios.put(
                `${API_BASE_URL}/user/users/${user.id}`,
                {
                    fullName: formData.fullName,
                    phoneNumber: formData.phoneNumber,
                    address: formData.address,
                    profileImage: formData.profileImage,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Update the user in auth context - properly typed
                if (updateUser) {
                    const updatedUser = {
                        ...user,
                        fullName: formData.fullName,
                        phoneNumber: formData.phoneNumber,
                        address: formData.address,
                        profileImage: formData.profileImage,
                    };
                    updateUser(updatedUser);
                }

                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                
                // Clear success message after 3 seconds
                setTimeout(() => setMessage(null), 3000);
            }
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFormData({
                fullName: user.fullName || '',
                phoneNumber: user.phoneNumber || '',
                address: user.address || '',
                profileImage: user.profileImage || ''
            });
        }
    };

    // Get initials for avatar
    const getInitials = () => {
        if (!formData.fullName) return 'U';
        return formData.fullName
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (!user) {
        return (
            <div className="flex-1 overflow-y-auto bg-stone-50">
                <TopBar title="Settings" subtitle="Manage your account and preferences" />
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="mt-4 text-stone-600">Loading settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Settings" subtitle="Manage your account and preferences" />
            <div className="p-6 max-w-2xl mx-auto space-y-5">
                {/* Success/Error Message */}
                {message && (
                    <div className={`p-4 rounded-xl ${
                        message.type === 'success' 
                            ? 'bg-green-50 border border-green-200 text-green-700'
                            : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Profile */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Profile</h3>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                            {formData.profileImage ? (
                                <img 
                                    src={formData.profileImage} 
                                    alt={formData.fullName}
                                    className="w-16 h-16 rounded-full object-cover"
                                />
                            ) : (
                                <Avatar initials={getInitials()} size="lg" color="bg-amber-600" />
                            )}
                            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm hover:bg-stone-50">
                                <Edit size={10} className="text-stone-500" />
                            </button>
                        </div>
                        <div>
                            <p className="font-bold text-stone-800">{formData.fullName || 'User'}</p>
                            <p className="text-sm text-stone-400">
                                {user.role === 'owner' ? 'Owner' : 'Renter'} since {
                                    user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '2025'
                                }
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                                <Stars rating={4.7} />
                                <span className="text-xs text-stone-400">4.7 avg rating</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Full Name</label>
                            <input
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Email</label>
                            <input
                                value={user.email || ''}
                                disabled
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-stone-50 text-stone-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Phone Number</label>
                            <input
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleInputChange}
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Location</label>
                            <input
                                name="address"
                                value={formData.address}
                                onChange={handleInputChange}
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Save Changes
                                </>
                            )}
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-5 py-2.5 border border-stone-200 hover:bg-stone-50 text-stone-700 text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
                        >
                            <X size={16} />
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Notifications</h3>
                    <div className="space-y-3">
                        {[
                            { key: "bookingReq", label: "New booking requests" },
                            { key: "messages", label: "New messages from renters" },
                            { key: "reviews", label: "New reviews on listings" },
                            { key: "payments", label: "Payment confirmations" },
                            { key: "promos", label: "Promotions and tips" },
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between py-2">
                                <span className="text-sm text-stone-700">{label}</span>
                                <button
                                    onClick={() => toggleNotif(key as keyof NotificationSettings)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${
                                        notif[key as keyof NotificationSettings] ? "bg-amber-600" : "bg-stone-200"
                                    }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${
                                        notif[key as keyof NotificationSettings] ? "left-6" : "left-1"
                                    }`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payout Settings - Only for owners */}
                {user.role === 'owner' && (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                        <h3 className="font-bold text-stone-800 mb-4">Payout Settings</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1.5">Bank Name</label>
                                <input
                                    defaultValue="Nabil Bank"
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1.5">Account Number</label>
                                <input
                                    defaultValue="••••••••7842"
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-stone-500 mb-1.5">Payout Schedule</label>
                                <select className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                                    <option>Weekly</option>
                                    <option>Bi-weekly</option>
                                    <option>Monthly</option>
                                </select>
                            </div>
                        </div>
                        <button className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors">
                            Update Payout Info
                        </button>
                    </div>
                )}

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                    <h3 className="font-bold text-red-600 mb-3">Danger Zone</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-stone-800">Delete Account</p>
                            <p className="text-xs text-stone-400">This will permanently remove all your data</p>
                        </div>
                        <button className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};