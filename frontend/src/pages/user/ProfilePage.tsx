import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/auth.services";

// Define the profile data types
interface Rental {
  id: string;
  itemName: string;
  category: string;
  rentalDate: string;
  returnDate: string;
  status: "active" | "completed" | "pending";
  price: number;
  image?: string;
}

interface Listing {
  id: string;
  title: string;
  category: string;
  price: number;
  rentalPeriod: string;
  image?: string;
  status: "available" | "rented" | "unavailable";
}

interface Favorite {
  id: string;
  title: string;
  category: string;
  price: number;
  image?: string;
}

interface ProfileStats {
  totalRentals: number;
  totalEarnings: number;
  totalListings: number;
  rating: number;
}

interface ProfileData {
  user: {
    id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
    role: string;
    address: string;
    isVerified: boolean;
    profileImage: string;
    kycStatus: string;
    joinedDate: string;
  };
  profile: {
    bio: string;
    listings: Listing[];
    rentals: Rental[];
    favorites: Favorite[];
    paymentMethods: any[];
    profileComplete: boolean;
    stats?: ProfileStats;
  };
}

function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await authService.getProfile();
        setProfileData(data);
      } catch (err: any) {
        setError(err.message || "Failed to load profile");
        console.error("Profile fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 mt-12 flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-stone-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-2xl">
          <p className="font-medium">Error loading profile</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Merge user data from profile API and auth context
  const profileUser = profileData?.user;
  const displayUser = profileUser || user;

  // Get profile data with defaults
  const profile = profileData?.profile || { 
    bio: "", 
    listings: [], 
    rentals: [], 
    favorites: [], 
    paymentMethods: [],
    profileComplete: false 
  };

  // Safely get user properties with fallbacks
  const fullName = displayUser?.fullName || "User";
  const email = displayUser?.email || "No email";
  const address = displayUser?.address || "Nepal";
  
  // Check if KYC is verified (check both possible property names)
  const isKycVerified = 
    displayUser?.isKycVerified === true || 
    displayUser?.kycStatus === "verified" ||
    displayUser?.isVerified === true ||
    false;

  // Get member since date
  const memberSince = 
    displayUser?.createdAt || 
    displayUser?.joinedDate || 
    profileData?.user?.joinedDate ||
    null;

  const memberSinceFormatted = memberSince 
    ? new Date(memberSince).toLocaleDateString() 
    : "—";

  // Get stats
  const activeRentals = profile.rentals?.filter((r: Rental) => r.status === "active").length || 0;
  const completedRentals = profile.rentals?.filter((r: Rental) => r.status === "completed").length || 0;
  const wishlistCount = profile.favorites?.length || 0;
  const rating = profile.stats?.rating || 0;

  const stats = [
    { label: "Active Rentals", value: activeRentals.toString(), icon: "📦" },
    { label: "Completed", value: completedRentals.toString(), icon: "✅" },
    { label: "Wishlist", value: wishlistCount.toString(), icon: "❤️" },
    { label: "Reviews", value: rating.toString(), icon: "⭐" },
  ];

  const rentals = profile.rentals || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      {/* Profile Header */}
      <div className="bg-linear-to-br from-stone-900 to-stone-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-900 font-black text-3xl shadow-lg">
            {fullName.split(" ").map((word: string) => word[0]).join("").toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
            <p className="text-stone-400 text-sm mt-0.5">
              {email} · {address}
            </p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                isKycVerified
                  ? "bg-green-500/20 text-green-400 border-green-500/30"
                  : "bg-red-500/20 text-red-400 border-red-500/30"
              }`}>
                {isKycVerified ? "✓ KYC Verified" : "✗ KYC Not Verified"}
              </span>
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">
                ● Active Member
              </span>
              <span className="bg-stone-700 text-stone-300 text-xs px-3 py-1 rounded-full font-medium">
                Member since {memberSinceFormatted}
              </span>
            </div>
          </div>
          <button 
            onClick={() => navigate("/settings")} 
            className="bg-amber-500 text-stone-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-amber-300 hover:shadow-md transition-all">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rental History */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="font-bold text-stone-900 text-lg">Rental History</h2>
          <button className="text-amber-600 text-sm font-medium hover:text-amber-700">View All</button>
        </div>
        <div className="divide-y divide-stone-100">
          {rentals.length > 0 ? (
            rentals.map((r: Rental, i: number) => (
              <div key={r.id || i} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
                  {r.image || "📦"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-900 text-sm truncate">{r.itemName}</p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {r.rentalDate && r.returnDate 
                      ? `${new Date(r.rentalDate).toLocaleDateString()} – ${new Date(r.returnDate).toLocaleDateString()}`
                      : "No dates available"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-stone-900 text-sm">
                    Rs. {(r.price || 0).toLocaleString()}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    r.status === "active"
                      ? "bg-green-100 text-green-700"
                      : r.status === "completed"
                        ? "bg-stone-100 text-stone-500"
                        : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {r.status === "active" ? "● Active" : r.status === "completed" ? "✓ Done" : "Pending"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-stone-500">
              <p>No rentals yet</p>
              <p className="text-sm mt-1">Start renting items to see them here!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bio Section - Only show if there's a bio */}
      {profile.bio && (
        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="font-bold text-stone-900 mb-2">About Me</h3>
          <p className="text-stone-600">{profile.bio}</p>
        </div>
      )}

      {/* Listings Section - Only show if there are listings */}
      {profile.listings && profile.listings.length > 0 && (
        <div className="mt-6 bg-white border border-stone-200 rounded-2xl p-6">
          <h3 className="font-bold text-stone-900 mb-4">My Listings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.listings.map((listing: Listing, i: number) => (
              <div key={listing.id || i} className="border border-stone-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-amber-50 flex items-center justify-center text-2xl">
                    {listing.image || "📦"}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-stone-900">{listing.title}</h4>
                    <p className="text-sm text-stone-500">{listing.category}</p>
                    <p className="text-sm font-bold text-amber-600">Rs. {listing.price}/day</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    listing.status === "available"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {listing.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;