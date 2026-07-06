import { useEffect, useState } from "react";
import axios from "axios";
import { Avatar } from "../../components/owner/Avatar";
import { Stars } from "../../components/owner/Stars";
import { TopBar } from "../../components/owner/TopBar";

import API_BASE_URL from "../../config/api";
import { authService } from "../../services/auth.services";

interface ReviewItem {
    _id: string;
    itemID: { _id: string; title?: string; images?: unknown[] };
    userID: { _id: string; fullName?: string; profileImage?: string };
    rating: number;
    message: string;
    createdAt: string;
}

interface ReviewSummary {
    avgRating: number;
    totalReviews: number;
    distribution: { rating: number; count: number }[];
}

const getInitials = (name?: string) => {
    if (!name || typeof name !== "string") return "??";
    return name
        .trim()
        .split(" ")
        .filter(Boolean)
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();
};

export const Reviews = () => {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [summary, setSummary] = useState<ReviewSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const token = authService.getAccessToken();

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                setError(null);

                const [reviewsRes, summaryRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/api/rating/owner`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                    axios.get(`${API_BASE_URL}/api/rating/owner/summary`, {
                        headers: { Authorization: `Bearer ${token}` },
                    }),
                ]);

                setReviews(reviewsRes.data.reviews);
                setSummary(summaryRes.data);
            } catch (err) {
                console.error("Failed to fetch reviews:", err);
                setError("Failed to load reviews. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [token]);

    if (loading) {
        return (
            <div className="flex-1 h-screen overflow-y-auto bg-stone-50">
                <TopBar title="Reviews" subtitle="What renters say about your listings" />
                <div className="p-6">
                    <p className="text-stone-400 text-sm">Loading reviews...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 h-screen overflow-y-auto bg-stone-50">
                <TopBar title="Reviews" subtitle="What renters say about your listings" />
                <div className="p-6">
                    <p className="text-red-500 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 h-screen overflow-y-auto bg-stone-50">
            <TopBar title="Reviews" subtitle="What renters say about your listings" />
            <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex gap-8 items-center">
                        <div className="text-center">
                            <p className="text-5xl font-black text-stone-900">
                                {summary?.avgRating.toFixed(1) ?? "0.0"}
                            </p>
                            <Stars rating={summary?.avgRating ?? 0} />
                            <p className="text-sm text-stone-400 mt-1">
                                {summary?.totalReviews ?? 0} reviews
                            </p>
                        </div>
                        <div className="flex-1 space-y-2">
                            {summary?.distribution.map(({ rating, count }) => (
                                <div key={rating} className="flex items-center gap-3">
                                    <span className="text-xs text-stone-500 w-3">{rating}</span>
                                    <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-amber-400 h-2 rounded-full transition-all"
                                            style={{
                                                width: `${
                                                    summary.totalReviews
                                                        ? (count / summary.totalReviews) * 100
                                                        : 0
                                                }%`,
                                            }}
                                        />
                                    </div>
                                    <span className="text-xs text-stone-400 w-3">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Review Cards */}
                {reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-8 text-center">
                        <p className="text-stone-400 text-sm">No reviews yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((r) => (
                            <div
                                key={r._id}
                                className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5"
                            >
                                <div className="flex items-start gap-3">
                                    <Avatar
                                        initials={getInitials(r.userID?.fullName)}
                                        size="md"
                                        color="bg-stone-600"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-semibold text-stone-800">
                                                {r.userID?.fullName || "Unknown renter"}
                                            </p>
                                            <span className="text-stone-300">·</span>
                                            <p className="text-xs text-stone-400">
                                                {r.itemID?.title || "Item"}
                                            </p>
                                            <span className="ml-auto text-xs text-stone-400">
                                                {new Date(r.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="mt-1.5">
                                            <Stars rating={r.rating} />
                                        </div>
                                        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
                                            {r.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};