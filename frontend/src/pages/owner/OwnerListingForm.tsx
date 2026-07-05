import { useState, useEffect, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";
import API_BASE_URL from "../../config/api";
import { useAuth } from "../../hooks/useAuth";


interface Category {
    _id: string;
    name: string;
    description: string;
    image: string;
}
const condition = ["new", "like new", "used", "old"]

interface ListingFormState {
    title: string;
    description: string;
    location: string;
    price: string;
    categoryID: string;
    ownerID: string;
    condition: string;
}

interface ExistingImage {
    url: string;
    markedForRemoval: boolean;
}


interface PassedListing {
    id: number | string;
    title?: string;
    categoryID?: string;
    description?: string;
    price?: number;
    location?: string;
    condition?: string;
    images?: string[];
}

interface NavigationState {
    listing?: PassedListing;
}

const EMPTY_FORM: ListingFormState = {
    title: "",
    description: "",
    categoryID: "",
    price: "",
    location: "",
    ownerID: "",
    condition: ""

};

export default function OwnerListingForm() {
    const navigate = useNavigate();
    const { itemId } = useParams<{ itemId: string }>();

    const routerLocation = useLocation();
    const isEditMode = Boolean(itemId);
    const { user } = useAuth();
    const passedListing = (routerLocation.state as NavigationState | null)?.listing;

    const [form, setForm] = useState<ListingFormState>(EMPTY_FORM);
    const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
    const [newImages, setNewImages] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    useEffect(() => {
        fetchCategories();
    }, []);
    const token = localStorage.getItem("token");

    const fetchCategories = async () => {
        try {
            const res = await axios.get(
                `${API_BASE_URL}/api/category/getcategory`, {
                headers: { Authorization: `Bearer ${token}` },
            }
            );
            setCategories(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        if (isEditMode && passedListing) {
            setForm({
                title: passedListing.title ?? "",
                categoryID: passedListing.categoryID ?? "",
                description: passedListing.description ?? "",
                price: passedListing.price != null ? String(passedListing.price) : "",
                location: passedListing.location ?? "",
                ownerID: user?.id ?? "",
                condition: passedListing.condition ?? ""

            });
            if (passedListing.images?.length) {
                setExistingImages(passedListing.images.map(url => ({ url, markedForRemoval: false })));
            }
        }
    }, [isEditMode, passedListing]);

    const updateField = <K extends keyof ListingFormState>(key: K, value: ListingFormState[K]) => {
        setForm(prev => ({ ...prev, [key]: value }));
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        if (!files.length) return;
        setNewImages(prev => [...prev, ...files]);
        setNewImagePreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
        e.target.value = "";
    };

    const removeNewImage = (index: number) => {
        setNewImages(prev => prev.filter((_, i) => i !== index));
        setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const toggleExistingImageRemoval = (index: number) => {
        setExistingImages(prev =>
            prev.map((img, i) => (i === index ? { ...img, markedForRemoval: !img.markedForRemoval } : img))
        );
    };

    const validateForm = (): string | null => {
        if (!form.title.trim()) return "Please enter a title for your item.";
        if (!form.categoryID) return "Please choose a category.";

        if (!form.location.trim()) return "Please enter a location.";
        return null;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("description", form.description);
            formData.append("location", form.location);
            formData.append("price", form.price);
            formData.append("categoryId", form.categoryID);
            formData.append("ownerId", user?.id ?? "");
            formData.append("condition", form.condition);
            // formData.append("weeklyPrice", form.weeklyPrice);
            // formData.append("deposit", form.deposit);
            // formData.append("instantBooking", String(form.instantBooking));

            newImages.forEach(file => formData.append("images", file));


            if (isEditMode) {
                const keepImages = existingImages.filter(img => !img.markedForRemoval).map(img => img.url);
                formData.append("existingImages", JSON.stringify(keepImages));
            }

            const url = isEditMode ? `${API_BASE_URL}/api/edititem/${itemId}` : `${API_BASE_URL}/api/items/additems`;



            const response = await fetch(url, {

                method: isEditMode ? "PUT" : "POST",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                const text = await response.text().catch(() => "");
                throw new Error(text || `Request failed with status ${response.status}`);
            }

            setSuccess(true);
            setTimeout(() => navigate("/owner/listings"), 900);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="flex-1 overflow-y-auto h-screen ">
            <div className="w-full ">

                <div className="bg-white rounded-3xl border border-stone-100 shadow-sm w-full px-12 pb-8">
                    <div className="p-6 border-b border-stone-100">
                        <h1 className="text-lg font-bold text-stone-800">
                            {isEditMode ? "Edit Listing" : "Add New Listing"}
                        </h1>
                        <p className="text-sm text-stone-400">
                            {isEditMode ? "Update the details of your listing" : "Fill in the details below to list a new item"}
                        </p>
                    </div>

                    {error && (
                        <div className="mx-6 mt-6 flex items-start gap-2 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mx-6 mt-6 flex items-start gap-2 bg-emerald-50 border border-emerald-100 text-emerald-600 text-sm rounded-xl px-4 py-3">
                            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                            <span>{isEditMode ? "Listing updated successfully." : "Listing published successfully."}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Item Title</label>
                                <input
                                    value={form.title}
                                    onChange={e => updateField("title", e.target.value)}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                    placeholder="e.g. Canon EOS R5 Camera Kit"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Category</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {categories.map(c => (
                                        <button
                                            type="button"
                                            key={c._id}
                                            onClick={() => updateField("categoryID", c._id)}
                                            className={`border rounded-xl py-2 text-xs transition-colors ${form.categoryID === c._id
                                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                                : "border-stone-200 text-stone-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                                                }`}
                                        >
                                            {c.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Condition</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {condition.map(c => (
                                        <button
                                            type="button"
                                            key={c}
                                            onClick={() => updateField("condition", c)}
                                            className={`border rounded-xl py-2 text-xs transition-colors ${form.condition === c
                                                ? "border-amber-500 bg-amber-50 text-amber-700"
                                                : "border-stone-200 text-stone-600 hover:border-amber-400 hover:bg-amber-50 hover:text-amber-700"
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Description</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => updateField("description", e.target.value)}
                                    rows={3}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    placeholder="Describe your item…"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Daily Price (रू)</label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={e => updateField("price", e.target.value)}
                                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        placeholder="0.00"
                                    />
                                </div>
                                {/* <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Weekly Price (रू)</label>
                                    <input
                                        type="number"
                                        value={form.weeklyPrice}
                                        onChange={e => updateField("weeklyPrice", e.target.value)}
                                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                        placeholder="0.00"
                                    />
                                </div> */}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Location</label>
                                <input
                                    value={form.location}
                                    onChange={e => updateField("location", e.target.value)}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="Kathmandu, Nepal"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1.5">Deposit Amount (रू)</label>
                                <input
                                    type="number"
                                    value={form.deposit}
                                    onChange={e => updateField("deposit", e.target.value)}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="0.00"
                                />
                            </div> */}
                            {/* 
                            <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="instant"
                                    checked={form.instantBooking}
                                    onChange={e => updateField("instantBooking", e.target.checked)}
                                    className="accent-amber-500 w-4 h-4"
                                />
                                <label htmlFor="instant" className="text-sm text-stone-700">
                                    Enable <strong>Instant Booking</strong> (no approval needed)
                                </label>
                            </div> */}

                            <div className="pt-2 border-t border-stone-100">
                                <label className="block text-sm font-medium text-stone-700 mb-1.5 mt-4">Photos</label>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg"
                                    multiple
                                    className="hidden"
                                    onChange={handleFileSelect}
                                />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-stone-200 rounded-2xl p-8 text-center hover:border-amber-400 transition-colors cursor-pointer group"
                                >
                                    <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-amber-100">
                                        <Upload size={22} className="text-amber-500" />
                                    </div>
                                    <p className="text-sm font-medium text-stone-700">Drop photos here or click to upload</p>
                                    <p className="text-xs text-stone-400 mt-1">PNG, JPG up to 10MB · Minimum 3 photos</p>
                                </div>

                                {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                                    <div className="grid grid-cols-3 gap-2 mt-3">
                                        {existingImages.map((img, i) => (
                                            <div
                                                key={`existing-${i}`}
                                                className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative group"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt=""
                                                    className={`w-full h-full object-cover ${img.markedForRemoval ? "opacity-30" : ""}`}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => toggleExistingImageRemoval(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={13} className="text-white" />
                                                </button>
                                                {img.markedForRemoval && (
                                                    <span className="absolute bottom-1 left-1 right-1 text-[10px] text-center bg-red-500 text-white rounded-md py-0.5">
                                                        Removing
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                        {newImagePreviews.map((src, i) => (
                                            <div
                                                key={`new-${i}`}
                                                className="aspect-square bg-stone-100 rounded-xl overflow-hidden relative group"
                                            >
                                                <img src={src} alt="" className="w-full h-full object-cover" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeNewImage(i)}
                                                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 hover:bg-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <X size={13} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 p-6 pt-0">
                            <button
                                type="button"
                                onClick={() => navigate("/owner/listings")}
                                className="flex-1 py-3 rounded-xl border border-stone-200 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-3 rounded-xl bg-amber-500 text-white text-sm font-semibold hover:bg-amber-600 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {submitting && <Loader2 size={16} className="animate-spin" />}
                                {isEditMode ? "Save Changes" : "Publish Listing"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
}