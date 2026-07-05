import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { validatePasswordChange } from "../../utils/validation";

function UserSettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
      const token = authService.getAccessToken();

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try{
      const res = await axios.patch(`${API_BASE_URL}/api/user/deactivate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if(res.data.success){
      setMessage({
        type: 'success',
        text: 'Account deleted successfully'
      });

      setTimeout(() => {
        setMessage(null);
        logout();
        // window.location.href = '/login';
      }, 3000);
    }
    } catch (error) {
      console.error('Error deleting account:', error);
      setMessage({
        type: 'error',
        text: 'Failed to delete account'
      });
    }
  }
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Password validation errors
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});

 

  const [activeTab, setActiveTab] = useState<"account" | "password"  | "danger" | "kyc">("account");

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "password", label: "Change Password", icon: "🔒" },
  
    { id: "danger", label: "Danger Zone", icon: "⚠️" },
    { id: "kyc", label: "KYC Status", icon: "✅" },
  ];

  // Load user data
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
      });
    }
  }, [user]);



  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field when user types
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSaveProfile = async () => {
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

      const response = await axios.put(
        `${API_BASE_URL}/api/user/users`,
        {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          address: formData.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        if (updateUser) {
          const updatedUser = {
            ...user,
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber,
            address: formData.address,
          };
          updateUser(updatedUser);
        }

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update profile'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    // Validate password using the existing validation function
    const { isValid, errors } = validatePasswordChange(passwordData);
    setPasswordErrors(errors);

    if (!isValid) {
      setMessage({ type: 'error', text: 'Please fix the validation errors' });
      return;
    }

    try {
      setIsChangingPassword(true);
      setMessage(null);

      const token = authService.getAccessToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Call the password change endpoint
      const response = await axios.post(
        `${API_BASE_URL}/api/user/change-password`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setPasswordErrors({});
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error: any) {
      console.error('Error updating password:', error);
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to update password'
      });
    } finally {
      setIsChangingPassword(false);
    }
  };


  // Password requirements list
  const passwordRequirements = [
    { label: 'At least 6 characters', check: (p: string) => p.length >= 6 },
    { label: 'At least one uppercase letter', check: (p: string) => /[A-Z]/.test(p) },
    { label: 'At least one lowercase letter', check: (p: string) => /[a-z]/.test(p) },
    { label: 'At least one number', check: (p: string) => /[0-9]/.test(p) },
    { label: 'At least one special character (!@#$%^&*)', check: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
  ];

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-10 mt-12">
        <div className="flex justify-center items-center min-h-100">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-stone-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }


  const normalizeKycStatus = (status?: string) => {
    if (!status) return "rejected";

    const s = status.toLowerCase().trim();

    if (s === "verified") return "verified";
    if (s === "pending") return "pending";
    if (s === "under_review") return "under_review";
    return "rejected";
  };

  const kycStatus = normalizeKycStatus(user?.kycStatus);

  const kycItems = [
    { label: "Citizenship / National ID", icon: "🪪" },
    { label: "Selfie Verification", icon: "🤳" },
    { label: "Phone Number", icon: "📱" },
    { label: "Email Address", icon: "📧" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 mt-12">
      <h1 className="text-3xl font-bold text-stone-900 font-serif mb-8">Settings</h1>

      {/* Success/Error Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="sm:w-52 flex sm:flex-col gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${activeTab === t.id
                ? "bg-stone-900 text-amber-400"
                : "text-stone-600 hover:bg-stone-100"
                }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {activeTab === "account" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">Account Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-500 bg-stone-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-stone-400 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                  <input
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">Address</label>
                  <input
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="mt-6 bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
        
            </div>
          )}
          {activeTab === "password" && (
            <div className="p-6">
            
              <div className=" border-stone-100">
                <h3 className="font-bold text-stone-900 mb-4">Change Password</h3>

                {/* Password Requirements */}
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <p className="text-xs font-semibold text-amber-800 mb-2">Password Requirements:</p>
                  <ul className="space-y-1">
                    {passwordRequirements.map((req, index) => {
                      const isMet = req.check(passwordData.newPassword);
                      return (
                        <li key={index} className="flex items-center gap-2 text-xs">
                          <span className={isMet ? 'text-green-600' : 'text-amber-600'}>
                            {isMet ? '✓' : '○'}
                          </span>
                          <span className={isMet ? 'text-green-700' : 'text-amber-700'}>
                            {req.label}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div>
                    <input
                      name="currentPassword"
                      type="password"
                      placeholder="Current Password"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${passwordErrors.currentPassword
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-stone-200 focus:border-amber-400 focus:ring-amber-100'
                        }`}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                  <div>
                    <input
                      name="newPassword"
                      type="password"
                      placeholder="New Password"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${passwordErrors.newPassword
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-stone-200 focus:border-amber-400 focus:ring-amber-100'
                        }`}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  <div>
                    <input
                      name="confirmPassword"
                      type="password"
                      placeholder="Confirm Password"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-all ${passwordErrors.confirmPassword
                        ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                        : 'border-stone-200 focus:border-amber-400 focus:ring-amber-100'
                        }`}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleUpdatePassword}
                  disabled={isChangingPassword}
                  className="mt-4 border border-stone-900 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-900 hover:text-white transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <>
                      <div className="w-4 h-4 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>
          )}

 

          {activeTab === "danger" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">Danger Zone</h2>
              <p className="text-sm text-stone-600 mb-4">Be cautious! Actions in this section are irreversible.</p>

              <form onSubmit={handleDeleteAccount} className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl">
                <h3 className="font-semibold text-red-700 text-sm mb-1">Danger Zone</h3>
                <p className="text-xs text-red-500 mb-3">These actions are permanent and cannot be undone.</p>
                <button className="text-red-600 border border-red-200 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </form>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">KYC Verification Status</h2>
              <div className={`rounded-2xl p-5 flex items-start gap-4 mb-6 ${user.kycStatus == "verified" || user.kycStatus == "under_review"
                ? 'bg-green-50 border border-green-200'
                : 'bg-yellow-50 border border-yellow-200'
                }`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg shrink-0 ${user.kycStatus == "approved" ? 'bg-green-500' : user.kycStatus == "under_review" ? 'bg-yellow-500' : 'bg-red-400'
                  }`}>
                  {user.kycStatus == "approved" ? '✓' : user.kycStatus == "pending" || user.kycStatus == "under_review" ? '⏳' : ''}
                </div>
                <div>
                  <p className={`font-bold ${user.kycStatus ? 'text-green-800' : 'text-yellow-800'
                    }`}>
                    {user.kycStatus ? 'Fully Verified' : 'Verification Pending'}
                  </p>
                  <p className={`text-sm mt-0.5 ${user.kycStatus ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                    {user.kycStatus == "verified"
                      ? 'Your account is verified and ready to rent items.' :
                      user.kycStatus == "under_review" ? 'Your account is under review .' : 'Please complete KYC verification to unlock all features.'}
                  </p>
                  {user?.createdAt && (
                    <p className={`text-xs mt-1 ${user?.kycStatus == "approved" ? 'text-green-500' : user?.kycStatus == "under_review" ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                      {user?.kycStatus == "verified"
                        ? `Verified on ${new Date(user.createdAt).toLocaleDateString()}`
                        :
                        user?.kycStatus == "under_review" ? 'Your KYC is under review.' : 'Submit your documents for verification'}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                {kycItems.map((d) => (
                  <div
                    key={d.label}
                    className="flex items-center justify-between p-4 bg-stone-50 rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{d.icon}</span>
                      <span className="text-sm font-medium text-stone-700">
                        {d.label}
                      </span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold ${kycStatus === "verified"
                        ? "bg-green-100 text-green-700"
                        :  kycStatus === "under_review"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                        }`}
                    >
                      {kycStatus === "verified"
                        ? "✓ Verified"
                        : kycStatus === "pending"
                        ?"⏳ Pending":
                          kycStatus === "under_review"
                          ? "⏳ Under Review"
                          : "❎ Rejected"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserSettingsPage;