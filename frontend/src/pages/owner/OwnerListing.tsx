import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MapPin, Edit3, Trash2, MoreVertical, Search } from "lucide-react";
import { TopBar } from "../../components/owner/TopBar";
import { ConfirmDeleteModal } from "../../components/owner/ConfirmDeleteModal";
import API_BASE_URL from "../../config/api";
import { ImageSlider } from "../user/ImageSlider";
import { useAuth } from "../../hooks/useAuth.ts";
import axios from "axios";
import { authService } from "../../services/auth.services.ts";
import { toast } from "sonner";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    categoryId: string;
    location: string;
    availability: string;
}

interface ListingCardProps {
    listing: Product;
    onEdit: (listing: Product) => void;
    onDeleteClick: (id: string) => void;
    onAvailabilityChange: (id: string, status: string) => void;
    menuOpenId: string | null;
    setMenuOpenId: (id: string | null) => void;
}

const ListingCard: React.FC<ListingCardProps> = ({
    listing,
    onEdit,
    onDeleteClick,
    onAvailabilityChange,
    menuOpenId,
    setMenuOpenId
}) => {
    const menuOpen = menuOpenId === listing.id;
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!menuOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpenId(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [menuOpen, setMenuOpenId]);

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

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpenId(menuOpen ? null : listing.id)}
                            className="p-1 rounded-lg hover:bg-stone-100"
                        >
                            <MoreVertical size={16} />
                        </button>

                        {menuOpen && (
                            <div className="absolute right-0 top-8 bg-white border rounded-xl shadow-lg z-10 min-w-36 py-1">
                                <button
                                    onClick={() => {
                                        onEdit(listing);
                                        setMenuOpenId(null);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-stone-50"
                                >
                                    <Edit3 size={14} />
                                    Edit
                                </button>

                                <button
                                    onClick={() => {
                                        onDeleteClick(listing.id);
                                        setMenuOpenId(null);
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

                    <button
                        onClick={() =>
                            onAvailabilityChange(
                                listing.id,
                                listing.availability === "available"
                                    ? "unavailable"
                                    : "available"
                            )
                        }
                        className={`text-xs px-3 py-1 rounded-full font-medium ${listing.availability === "available"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                            }`}
                    >
                        {listing.availability === "available"
                            ? "Available"
                            : "Unavailable"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function OwnerListing() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [listingToDelete, setListingToDelete] = useState<string | null>(null);
    const { user } = useAuth();
    const token = authService.getAccessToken();

    const handleDeleteClick = (id: string) => {
        setListingToDelete(id);
    };

    const handleConfirmDelete = async () => {
        if (!listingToDelete) return;

        const id = listingToDelete;
        // Optimistic removal with rollback on failure
        const previousProducts = products;
        setProducts((prev) => prev.filter((item) => item.id !== id));
        setListingToDelete(null);

        try {
            const res = await axios.delete(`${API_BASE_URL}/api/items/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (res.status === 200) {
                toast.success("Listing deleted");
            }
        } catch (error) {
            console.error(error);
            setProducts(previousProducts);
            toast.error("Couldn't delete listing. Please try again.");
        }
    };

    const handleAddNew = () => navigate("/owner/listings/new");

    const handleEdit = (product: Product) => {
        navigate(`/owner/listings/edit/${product.id}`, {
            state: { product },
        });
    };

    const mapItemToProduct = (item: any): Product => {
        const buildImageUrl = (img: string): string => {
            if (!img) return "";
            if (img.startsWith("http")) return img;
            if (img.startsWith("/")) {
                return `${API_BASE_URL}${img}`;
            }
            return `${API_BASE_URL}/uploads/items/${img}`;
        };

        const imageUrls =
            item.images?.length > 0
                ? item.images.map(buildImageUrl)
                : ["https://picsum.photos/id/20/300/300"];

        return {
            id: item._id,
            name: item.title,
            description: item.description,
            price: item.price || 0,
            images: imageUrls,
            category: item.category || "Products",
            categoryId: item.categoryId || "",
            location: item.location,
            availability: item.availability
        };
    };

    const handleAvailabilityChange = async (id: string, status: string) => {
        try {
            const res = await axios.put(
                `${API_BASE_URL}/api/items/update-availability/${id}`,
                { availability: status },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json"
                    },
                }
            );
            if (res.status == 200) {
                fetchProducts();
                toast.success("Item status changed");
            }
        } catch (error) {
            console.error(error);
            toast.error("Couldn't update availability");
        }
    };

    useEffect(() => {
        if (user?.id) {
            fetchProducts();
        }
    }, [user?.id]);

    const fetchProducts = async () => {
        try {
            const url = `${API_BASE_URL}/api/items/getitemsbyownerId/${user?.id}`;
            const res = await fetch(url);

            if (!res.ok) {
                throw new Error(`Server responded ${res.status}`);
            }

            const responseData = await res.json();

            const rawItems: any[] | null = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.items)
                    ? responseData.items
                    : Array.isArray(responseData?.data)
                        ? responseData.data
                        : Array.isArray(responseData?.products)
                            ? responseData.products
                            : null;

            if (!rawItems) {
                console.error(
                    "getitemsbyownerId returned an unexpected shape — expected an array, or one of { items }, { data }, { products }. Got:",
                    responseData
                );
                setProducts([]);
                return;
            }

            const newItems: Product[] = rawItems.map((item: any) =>
                mapItemToProduct(item)
            );
            setProducts(newItems);
        } catch (err) {
            console.error("Error fetching products:", err);
            toast.error("Couldn't load your listings");
        }
    };

    const filteredProducts = products.filter((p) => {
        const q = searchQuery.trim().toLowerCase();
        if (!q) return true;
        return (
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.location.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        );
    });

    return (
        <>
            <div className="flex-col overflow-y-auto s h-screenpace-y-6 w-full">
                <TopBar title="My Listings" />
                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 gap-6">

                    <div className="">
                        <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="relative flex-1 max-w-sm">
                                <Search
                                    size={16}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
                                />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search your listings..."
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                />
                            </div>

                            <button onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-amber-200 transition-colors shrink-0">
                                <Plus size={18} />
                                <span>New Listing</span>
                            </button>
                        </div>

                        {searchQuery && filteredProducts.length === 0 && (
                            <p className="text-sm text-stone-400 mb-4">
                                No listings match "{searchQuery}".
                            </p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                            {filteredProducts.map(listing => (
                                <ListingCard
                                    key={listing.id}
                                    listing={listing}
                                    onEdit={handleEdit}
                                    onDeleteClick={handleDeleteClick}
                                    onAvailabilityChange={handleAvailabilityChange}
                                    menuOpenId={menuOpenId}
                                    setMenuOpenId={setMenuOpenId}
                                />
                            ))}
                            <button onClick={handleAddNew}
                                className="bg-white rounded-2xl border-2 border-dashed border-stone-200 hover:border-amber-400 h-full min-h-52 flex flex-col items-center justify-center gap-3 text-stone-400 hover:text-amber-500 transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-stone-100 group-hover:bg-amber-50 flex items-center justify-center transition-colors">
                                    <Plus size={22} />
                                </div>
                                <span className="text-sm font-medium">Add Listing</span>
                            </button>
                        </div>
                    </div>

                </main>
            </div>

            <ConfirmDeleteModal
                isOpen={!!listingToDelete}
                title="Delete Item"
                message="This will permanently remove the listing and its images. This action cannot be undone."
                onConfirm={handleConfirmDelete}
                onCancel={() => setListingToDelete(null)}
            />
        </>
    );
}