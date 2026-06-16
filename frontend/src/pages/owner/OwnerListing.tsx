import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus,  MapPin, Edit3, Trash2, MoreVertical} from "lucide-react";
import { TopBar } from "../../components/owner/TopBar";
import API_BASE_URL from "../../config/api";
import { ImageSlider } from "../user/ImageSlider";
const ownerId = "6a24e1db462be5606d0ca55d"


export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    images: string[];
    category: string;
    categoryId: string;
    location: string;
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
        <div className="bg-white rounded-2xl border  border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
            <div className="h-48 overflow-hidden">
                {/* <img
                    src={listing.images?.[0] || "https://picsum.photos/300/300"}
                    alt={listing.name}
                    className="w-full h-full object-cover"
                /> */}
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

                    <span className="text-xs bg-stone-100 px-2 py-1 rounded-full">
                        {listing.category}
                    </span>
                </div>
            </div>
        </div>
    );
};
export default function OwnerListing() {
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const handleDelete = (id: string) => {
        setProducts((prev) => prev.filter((item) => item.id !== id));
    };

    const handleAddNew = () => navigate("/owner/listings/new");

    const handleEdit = (product: Product) => {
        navigate(`/owner/listings/edit/${product.id}`, {
            state: { product },
        });
    };

    const mapItemToProduct = (
        item: any,
        baseUrl: string
    ): Product => {
        const buildImageUrl = (img: string): string => {
            if (!img) return "";

            if (img.startsWith("http")) return img;

            if (img.startsWith("/")) {
                return `${baseUrl}${img}`;
            }

            return `${baseUrl}/uploads/items/${img}`;
        };

        const imageUrls =
            item.images?.length > 0
                ? item.images.map(buildImageUrl)
                : ["https://picsum.photos/id/20/300/300"];

        return {
            id: item._id,
            name: item.title || "Unnamed Product",
            description: item.description || "No description available",
            price: item.price || 0,
            images: imageUrls,
            category: item.category || "Products",
            categoryId: item.categoryId || "",
            location: item.location || "Kathmandu",
        };
    };
    useEffect(() => {
        fetchProducts();
    }, [])
    const fetchProducts = async () => {
        try {
            const url = `${API_BASE_URL}/items/getitemsbyownerId/${ownerId}`;

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
                mapItemToProduct(item, "http://localhost:3000")
            );
            setProducts(newItems);
        } catch (err) {
            console.error("Error fetching products:", err);
        }
    };

    return (
        <>
            <div className="flex-col overflow-y-auto h-screen space-y-6 w-full">
                <TopBar title="My Listings" />
                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 gap-6">

                    {/* Listings Grid */}
                    <div className="">
                        <div className="flex items-center justify-end mb-4">
                            <button onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-amber-200 transition-colors">
                                <Plus size={18} />
                                <span>New Listing</span>
                            </button>
                        </div>
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
        </>
    );
}