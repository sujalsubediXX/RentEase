import { useState } from "react";
import {
    CalendarCheck, Star,
    Plus, ChevronRight,
    MapPin, Eye, Edit3, Trash2, MoreVertical,
     Wallet,
    RefreshCw
} from "lucide-react";
import { TopBar } from "../../components/owner/TopBar";

const LISTING_STATUS = {
    ACTIVE: "active",
    PAUSED: "paused",
    PENDING: "pending"
} as const;

const BOOKING_STATUS = {
    CONFIRMED: "confirmed",
    PENDING: "pending",
    CANCELLED: "cancelled"
} as const;

type ListingStatus = typeof LISTING_STATUS[keyof typeof LISTING_STATUS];
type BookingStatus = typeof BOOKING_STATUS[keyof typeof BOOKING_STATUS];



interface Listing {
    id: number;
    title: string;
    category: string;
    price: number;
    unit: string;
    location: string;
    status: ListingStatus;
    rating: number;
    reviews: number;
    views: number;
    bookings: number;
    image: string;
    color: string;
    earnings: number;
}

interface StatusBadgeProps {
    status: ListingStatus | BookingStatus;
}

interface ListingCardProps {
    listing: Listing;
    onEdit: (listing: Listing) => void;
    onDelete: (id: number) => void;
}

const listings: Listing[] = [
    {
        id: 1, title: "Canon EOS R5 Camera Kit", category: "Electronics",
        price: 85, unit: "day", location: "Kathmandu, Nepal",
        status: LISTING_STATUS.ACTIVE, rating: 4.9, reviews: 34,
        views: 1240, bookings: 28, image: "📷", color: "#dbeafe",
        earnings: 2380,
    },
    {
        id: 2, title: 'MacBook Pro 16" M3', category: "Electronics",
        price: 65, unit: "day", location: "Lalitpur, Nepal",
        status: LISTING_STATUS.ACTIVE, rating: 4.8, reviews: 19,
        views: 876, bookings: 15, image: "💻", color: "#d1fae5",
        earnings: 975,
    },
    {
        id: 3, title: "Trek Mountain Bike", category: "Sports",
        price: 20, unit: "day", location: "Pokhara, Nepal",
        status: LISTING_STATUS.PAUSED, rating: 4.7, reviews: 12,
        views: 540, bookings: 9, image: "🚵", color: "#fef3c7",
        earnings: 180,
    },
    {
        id: 4, title: "DJI Mavic 3 Drone", category: "Electronics",
        price: 120, unit: "day", location: "Bhaktapur, Nepal",
        status: LISTING_STATUS.PENDING, rating: 0, reviews: 0,
        views: 102, bookings: 0, image: "🚁", color: "#fce7f3",
        earnings: 0,
    },
    {
        id: 5, title: "Camping Tent (4-Person)", category: "Outdoors",
        price: 15, unit: "day", location: "Kathmandu, Nepal",
        status: LISTING_STATUS.ACTIVE, rating: 4.6, reviews: 8,
        views: 320, bookings: 6, image: "⛺", color: "#ede9fe",
        earnings: 90,
    },
];


const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const map = {
        active: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Active" },
        paused: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Paused" },
        pending: { bg: "bg-sky-100", text: "text-sky-700", dot: "bg-sky-500", label: "Pending" },
        confirmed: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Confirmed" },
        cancelled: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" },
    };
    const s = map[status as keyof typeof map] || map.pending;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
            {s.label}
        </span>
    );
};


const ListingCard: React.FC<ListingCardProps> = ({ listing, onEdit, onDelete }) => {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    return (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all overflow-hidden group">
            <div className="h-28 flex items-center justify-center text-5xl relative" style={{ background: listing.color }}>
                {listing.image}
                <div className="absolute top-3 right-3 flex gap-2">
                    <StatusBadge status={listing.status} />
                </div>
            </div>
            <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 truncate text-sm">{listing.title}</p>
                        <div className="flex items-center gap-1 mt-0.5 text-stone-400 text-xs">
                            <MapPin size={11} />
                            <span className="truncate">{listing.location}</span>
                        </div>
                    </div>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(v => !v)}
                            className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                            <MoreVertical size={16} />
                        </button>
                        {menuOpen && (
                            <div className="absolute right-0 top-8 bg-white border border-stone-200 rounded-xl shadow-lg z-10 min-w-36 py-1">
                                <button onClick={() => { onEdit(listing); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
                                    <Edit3 size={14} /> Edit Listing
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
                                    <Eye size={14} /> View Public Page
                                </button>
                                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50">
                                    <RefreshCw size={14} /> {listing.status === "paused" ? "Resume" : "Pause"}
                                </button>
                                <div className="my-1 border-t border-stone-100" />
                                <button onClick={() => { onDelete(listing.id); setMenuOpen(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-3 flex items-center justify-between">
                    <span className="text-amber-600 font-bold text-sm">रू{listing.price}<span className="text-stone-400 font-normal">/{listing.unit}</span></span>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                        <Star size={11} className="fill-amber-400 text-amber-400" />
                        <span className="font-medium">{listing.rating || "—"}</span>
                        <span className="text-stone-300">({listing.reviews})</span>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 pt-3 border-t border-stone-50 text-center">
                    {[
                        { label: "Views", value: listing.views.toLocaleString(), icon: Eye },
                        { label: "Bookings", value: listing.bookings, icon: CalendarCheck },
                        { label: "Earned", value: `Rs${listing.earnings}`, icon: Wallet },
                    ].map(({ label, value }) => (
                        <div key={label}>
                            <p className="text-xs font-semibold text-stone-700">{value}</p>
                            <p className="text-xs text-stone-400">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};


export default function OwnerListing() {
    const [showAddListing, setShowAddListing] = useState<boolean>(false);
    const [listingItems, setListingItems] = useState<Listing[]>(listings);

    const [editItem, setEditItem] = useState<Listing | null>(null);
    const handleDelete = (id: number): void => setListingItems(prev => prev.filter(l => l.id !== id));

    return (
        <>
              <div className="flex-1 overflow-y-auto  space-y-6">
                <TopBar title="My Listings"/>
                <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* Listings Grid */}
                <div className="xl:col-span-2">
                    <div className="flex items-center justify-end mb-4">
                        <button className="text-sm text-amber-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">
                            View all <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {listingItems.map(listing => (
                            <ListingCard
                                key={listing.id}
                                listing={listing}
                                onEdit={setEditItem}
                                onDelete={handleDelete}
                            />
                        ))}
                        {/* Add New Card */}
                        <button onClick={() => setShowAddListing(true)}
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