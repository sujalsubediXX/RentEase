import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Package, 
  User, 
  Tag, 
  Loader2,
  Eye,
  CheckCircle,
  Ban
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import API_BASE_URL from "../../config/api";

interface ListingDetail {
  _id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  availability: string;
  isActive: boolean;
  isApproved: boolean;
  condition: string;
  quantity: number;
  securityDeposit: number;
  createdAt: string;
  ownerId: {
    _id: string;
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  categoryId: {
    _id: string;
    name: string;
  };
  images: string[];
  bookingCount: number;
  totalEarnings: number;
}

const generatePlaceholderSVG = (width: number, height: number, text: string = 'No Image') => {
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" fill="#1c1917"/>
      <rect x="0" y="0" width="${width}" height="${height}" fill="#292524" rx="8"/>
      <text x="${width/2}" y="${height/2}" font-family="Arial" font-size="${Math.min(width, height) / 8}" fill="#78716c" text-anchor="middle" dominant-baseline="central">
        ${text}
      </text>
    </svg>
  `)}`;
};

const PLACEHOLDER_IMAGE = generatePlaceholderSVG(400, 300, 'No Image');
const PLACEHOLDER_THUMB = generatePlaceholderSVG(80, 80, 'No Image');

const getApiUrl = (endpoint: string) => {
  if (API_BASE_URL.endsWith('/api')) {
    return `${API_BASE_URL}${endpoint}`;
  }
  return `${API_BASE_URL}/api${endpoint}`;
};

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    available: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    active: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30",
    rented: "bg-sky-500/15 text-sky-400 border border-sky-500/30",
    unavailable: "bg-red-500/15 text-red-400 border border-red-500/30",
    inactive: "bg-stone-600/40 text-stone-400 border border-stone-600/50",
    pending: "bg-amber-500/15 text-amber-400 border border-amber-500/30",
  };
  return map[status] ?? "bg-stone-700 text-stone-300";
};

const conditionBadge = (condition: string) => {
  const map: Record<string, string> = {
    new: "bg-emerald-500/15 text-emerald-400",
    "like new": "bg-sky-500/15 text-sky-400",
    used: "bg-amber-500/15 text-amber-400",
    old: "bg-stone-500/15 text-stone-400",
  };
  return map[condition] ?? "bg-stone-500/15 text-stone-400";
};

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => {
      const newSet = new Set(prev);
      newSet.add(imageUrl);
      return newSet;
    });
  };

  const getDisplayImage = (imageUrl: string) => {
    if (imageErrors.has(imageUrl) || !imageUrl) {
      return PLACEHOLDER_IMAGE;
    }
    return imageUrl;
  };

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      
      if (!isAuthenticated || !user) {
        toast.error('Please login to view listing');
        navigate('/admin/listings');
        return;
      }

      const token = authService.getAccessToken();
      
      if (!token) {
        toast.error('Authentication token not found');
        navigate('/admin/listings');
        return;
      }

      // Fetch the specific item
      const itemResponse = await axios.get(
        getApiUrl(`/items/getitems`),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const items = itemResponse.data.data || itemResponse.data || [];
      const foundItem = items.find((item: any) => item._id === id);

      if (!foundItem) {
        toast.error('Listing not found');
        navigate('/admin/listings');
        return;
      }

      // Fetch bookings for this item
      const bookingsResponse = await axios.get(
        getApiUrl('/rentals/filterStatus?status=all'),
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const bookings = bookingsResponse.data.data || [];
      
      // Count bookings for this item
      const itemBookings = bookings.filter((b: any) => {
        let itemId = null;
        if (b.itemId) {
          if (typeof b.itemId === 'string') {
            itemId = b.itemId;
          } else if (typeof b.itemId === 'object' && b.itemId._id) {
            itemId = b.itemId._id;
          }
        }
        return itemId === id;
      });

      // Calculate total earnings from completed bookings
      const totalEarnings = itemBookings
        .filter((b: any) => b.status === 'confirmed' || b.status === 'completed')
        .reduce((sum: number, b: any) => sum + (b.totalPrice || 0), 0);

      // Get images - handle different possible formats
      let images: string[] = [];
      if (foundItem.images) {
        if (Array.isArray(foundItem.images)) {
          images = foundItem.images.map((img: any) => {
            if (typeof img === 'string') return img;
            if (typeof img === 'object' && img.imageUrl) return img.imageUrl;
            return '';
          }).filter(Boolean);
        }
      }

      setListing({
        ...foundItem,
        bookingCount: itemBookings.length,
        totalEarnings: totalEarnings,
        images: images
      });

      if (images.length > 0) {
        setSelectedImage(images[0]);
      }

    } catch (err: any) {
      console.error("Error fetching listing details:", err);
      toast.error(err.response?.data?.message || 'Failed to load listing details');
      navigate('/admin/listings');
    } finally {
      setLoading(false);
    }
  };

  const updateListingStatus = async (action: 'approve' | 'remove' | 'flag') => {
    if (!listing) return;
    
    try {
      setUpdating(true);
      const token = authService.getAccessToken();
      
      if (!token) {
        toast.error('Please login first');
        return;
      }

      await axios.put(
        getApiUrl(`/items/${listing._id}/status`),
        { action },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(`Listing ${action === 'approve' ? 'approved' : action === 'remove' ? 'removed' : 'flagged'} successfully`);
      await fetchListingDetails();
    } catch (err: any) {
      console.error("Error updating listing:", err);
      toast.error(err.response?.data?.message || 'Failed to update listing');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchListingDetails();
  }, [id, isAuthenticated]);

  const getStatus = (item: any): string => {
    if (item.isApproved === false) return 'pending';
    if (item.availability === 'available') return 'active';
    if (item.availability === 'rented') return 'rented';
    if (item.isActive === false) return 'inactive';
    return 'unavailable';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const day = String(date.getDate()).padStart(2, '0');
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatCurrency = (amount: number) => {
    return `Rs ${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 size={32} className="animate-spin text-amber-500 mx-auto mb-4" />
            <p className="text-stone-400">Loading listing details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="p-6">
        <div className="bg-stone-900 rounded-2xl p-8 text-center border border-stone-800">
          <p className="text-stone-400">Listing not found</p>
          <Link to="/admin/listings" className="mt-4 inline-block text-amber-400 hover:text-amber-300">
            Go back to listings
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatus(listing);

  return (
    <div className="p-6 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/admin/listings')}
        className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
      >
        <ArrowLeft size={18} /> Back to Listings
      </button>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4">
            <div className="aspect-video bg-stone-800 rounded-xl overflow-hidden flex items-center justify-center">
              {selectedImage ? (
                <img 
                  src={getDisplayImage(selectedImage)} 
                  alt={listing.title} 
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(selectedImage)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-stone-500">
                  <Package size={64} className="mb-2 opacity-50" />
                  <p>No image available</p>
                </div>
              )}
            </div>
            {listing.images && listing.images.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {listing.images.map((img, index) => {
                  const displayImg = imageErrors.has(img) ? PLACEHOLDER_THUMB : img;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(img)}
                      className={`w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === img 
                          ? 'border-amber-500' 
                          : 'border-transparent hover:border-stone-600'
                      }`}
                    >
                      <img 
                        src={displayImg}
                        alt={`${listing.title} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(img)}
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Description</h3>
            <p className="text-stone-300 text-sm leading-relaxed">
              {listing.description || 'No description provided.'}
            </p>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-4">
          {/* Title & Status */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <div className="flex items-start justify-between mb-3">
              <h1 className="text-xl font-bold text-white">{listing.title}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusBadge(status)}`}>
                {status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-400">
              <Tag size={14} />
              <span>{listing.categoryId?.name || 'Uncategorized'}</span>
            </div>
          </div>

          {/* Owner Info */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <h4 className="text-xs text-stone-500 uppercase tracking-wider mb-3">Owner</h4>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center">
                <User size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white">{listing.ownerId?.fullName || 'Unknown'}</p>
                <p className="text-xs text-stone-400">{listing.ownerId?.email || 'No email'}</p>
                <p className="text-xs text-stone-500">{listing.ownerId?.phoneNumber || 'No phone'}</p>
              </div>
            </div>
          </div>

          {/* Pricing & Details */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <h4 className="text-xs text-stone-500 uppercase tracking-wider mb-3">Pricing & Details</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Price per day</span>
                <span className="text-white font-bold">{formatCurrency(listing.price)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Security Deposit</span>
                <span className="text-white">{formatCurrency(listing.securityDeposit || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Quantity</span>
                <span className="text-white">{listing.quantity || 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-400">Condition</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${conditionBadge(listing.condition)}`}>
                  {listing.condition || 'Not specified'}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <h4 className="text-xs text-stone-500 uppercase tracking-wider mb-3">Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-stone-500">Total Bookings</p>
                <p className="text-lg font-bold text-white">{listing.bookingCount}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Total Earnings</p>
                <p className="text-lg font-bold text-amber-400">{formatCurrency(listing.totalEarnings)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Listed On</p>
                <p className="text-sm text-white">{formatDate(listing.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500">Location</p>
                <p className="text-sm text-white truncate">{listing.location || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-5">
            <h4 className="text-xs text-stone-500 uppercase tracking-wider mb-3">Actions</h4>
            <div className="flex flex-col gap-2">
              {status === "pending" && (
                <button 
                  onClick={() => updateListingStatus('approve')}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                  Approve Listing
                </button>
              )}
              {(status === "active" || status === "rented") && (
                <button 
                  onClick={() => updateListingStatus('flag')}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />} 
                  Flag Listing
                </button>
              )}
              {(status === "inactive" || status === "unavailable") && (
                <button 
                  onClick={() => updateListingStatus('approve')}
                  disabled={updating}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {updating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} 
                  Reactivate Listing
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};