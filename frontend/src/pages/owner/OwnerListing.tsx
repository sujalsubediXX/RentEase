import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Edit3, Trash2, MoreVertical } from "lucide-react";
import { TopBar } from "../../components/owner/TopBar";
import API_BASE_URL from "../../config/api";
import { ImageSlider } from "../user/ImageSlider";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/auth.services";
import axios from "axios";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    categoryId: string;
    location: string;
    availability: boolean;
    condition?: string;
}

interface ListingCardProps {
    listing: Product;
    onEdit: (listing: Product) => void;
    onDelete: (id: string) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
    listing,
    onEdit,
    onDelete,
}) => {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="h-48 overflow-hidden">
                <ImageSlider images={listing.images} />
            </div>

            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold text-stone-800">
                            {listing.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                            <MapPin size={12} />
                            {listing.location}
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setMenuOpen((v) => !v)}
                            className="p-1 rounded-lg hover:bg-stone-100"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-8 bg-white border rounded-xl shadow-lg z-10 min-w-36 py-1">
                                <button
                                    onClick={() => {
                                        onEdit(listing);
                                        setMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50"
                                >
                                    <Edit3 size={14} />
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        onDelete(listing.id);
                                        setMenuOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-sm text-stone-500 mt-2 line-clamp-2">
                    {listing.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                    <span className="font-bold text-amber-600">
                        Rs. {listing.price}
                    </span>
                    <div className="flex items-center gap-2">
                        {listing.condition && (
                            <span className="text-xs bg-stone-100 px-2 py-1 rounded-full">
                                {listing.condition}
                            </span>
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                            listing.availability 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                        }`}>
                            {listing.availability ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function OwnerListing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            const token = authService.getAccessToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            await axios.delete(`${API_BASE_URL}/items/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Remove from local state
            setProducts((prev) => prev.filter((item) => item.id !== id));
        } catch (err: any) {
            console.error('Error deleting item:', err);
            setError(err.response?.data?.message || 'Failed to delete item');
            setTimeout(() => setError(null), 3000);
        }
    };

    const handleAddNew = () => navigate("/owner/listings/new");

    const handleEdit = (product: Product) => {
        navigate(`/owner/listings/edit/${product.id}`);
    };

    const mapItemToProduct = (item: any, baseUrl: string): Product => {
        const buildImageUrl = (img: string): string => {
            if (!img) return "";
            if (img.startsWith("http")) return img;
            if (img.startsWith("/")) return `${baseUrl}${img}`;
            return `${baseUrl}/uploads/items/${img}`;
        };

        const imageUrls = item.images?.length > 0
            ? item.images.map(buildImageUrl)
            : ["https://picsum.photos/id/20/300/300"];

        return {
            id: item._id,
            name: item.title || "Unnamed Product",
            description: item.description || "No description available",
            price: item.price || 0,
            images: imageUrls,
            category: item.category?.name || item.category || "Products",
            categoryId: item.category?._id || item.categoryId || "",
            location: item.location || "Kathmandu",
            availability: item.availability !== undefined ? item.availability : true,
            condition: item.condition || "",
        };
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setIsLoading(true);
            const token = authService.getAccessToken();
            if (!token) {
                throw new Error('Not authenticated');
            }

            // Use the correct endpoint - /items/owner/me
            const response = await axios.get(`${API_BASE_URL}/items/owner/me`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const rawItems = response.data.items || [];
            const baseUrl = API_BASE_URL.replace('/api', '');
            
            const newItems: Product[] = rawItems.map((item: any) =>
                mapItemToProduct(item, baseUrl)
            );
            setProducts(newItems);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError(err.response?.data?.message || 'Failed to load listings');
            
            // If the endpoint doesn't exist yet, try the fallback
            if (err.response?.status === 404) {
                // Try alternative endpoint
                try {
                    const userId = user?.id;
                    if (userId) {
                        const fallbackResponse = await axios.get(`${API_BASE_URL}/items/owner/${userId}`, {
                            headers: {
                                Authorization: `Bearer ${authService.getAccessToken()}`
                            }
                        });
                        const rawItems = fallbackResponse.data.items || [];
                        const baseUrl = API_BASE_URL.replace('/api', '');
                        const newItems: Product[] = rawItems.map((item: any) =>
                            mapItemToProduct(item, baseUrl)
                        );
                        setProducts(newItems);
                    }
                } catch (fallbackErr) {
                    console.error("Fallback also failed:", fallbackErr);
                }
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-col overflow-y-auto h-screen space-y-6 w-full">
                <TopBar title="My Listings" />
                <main className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-stone-600">Loading listings...</p>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="flex-col overflow-y-auto h-screen space-y-6 w-full">
            <TopBar title="My Listings" />
            <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 gap-6">
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <div className="flex items-center justify-end mb-4">
                        <button
                            onClick={handleAddNew}
                            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-amber-200 transition-colors"
                        >
                            <Plus size={18} />
                            <span>New Listing</span>
                        </button>
                    </div>
                    
                    {products.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <h3 className="text-lg font-bold text-stone-900 mb-2">No listings yet</h3>
                            <p className="text-stone-500 mb-6">Start renting out your items by creating your first listing!</p>
                            <button
                                onClick={handleAddNew}
                                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-colors"
                            >
                                List Your First Item
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                            {products.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                            {/* Add New Card */}
                            <button
                                onClick={handleAddNew}
                                className="bg-white rounded-2xl border-2 border-dashed border-stone-200 hover:border-amber-400 h-full min-h-52 flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-amber-500 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-amber-50 flex items-center justify-center transition-colors">
                                    <Plus size={22} />
                                </div>
                                <span className="text-sm font-medium">Add Listing</span>
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}