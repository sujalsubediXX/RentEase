import { useState } from "react";
import { Avatar } from "../../components/owner/Avatar";
import { Stars } from "../../components/owner/Stars";
import { TopBar } from "../../components/owner/TopBar";
interface Review {
    id: number;
    listing: string;
    renter: string;
    avatar: string;
    rating: number;
    date: string;
    comment: string;
    helpful: number;
    reply: string;
}
export const mockReviews: Review[] = [
    { id: 1, listing: "Vintage Camera Kit", renter: "Arjun Sharma", avatar: "AS", rating: 5, date: "2026-05-20", comment: "Excellent condition! The camera worked perfectly for our event. Owner was very responsive.", helpful: 12, reply: "" },
    { id: 2, listing: "DSLR Canon EOS 90D", renter: "Rohan KC", avatar: "RK", rating: 5, date: "2026-05-18", comment: "Top-notch equipment. Clean, well-maintained and came with all accessories.", helpful: 8, reply: "Thank you Rohan! Glad the shoot went well." },
    { id: 3, listing: "Mountain Bike - Trek", renter: "Nisha Tamang", avatar: "NT", rating: 4, date: "2026-05-15", comment: "Good bike overall. Gears worked smoothly. Minor scratches but functional.", helpful: 5, reply: "" },
    { id: 4, listing: "Camping Tent (6-Person)", renter: "Dev Poudel", avatar: "DP", rating: 4, date: "2026-05-10", comment: "Spacious tent, easy to set up. Missing one stake but owner quickly resolved it.", helpful: 7, reply: "Apologies for the missing stake! Fixed it now." },
    { id: 5, listing: "Vintage Camera Kit", renter: "Mira Joshi", avatar: "MJ", rating: 5, date: "2026-05-08", comment: "Perfect for our travel photography needs. Every lens was spotless. 10/10!", helpful: 15, reply: "" },
];

export const Reviews = () => {
    const [replyText, setReplyText] = useState<Record<number, string>>({});
    const [showReply, setShowReply] = useState<Record<number, boolean>>({});

    const avgRating = (mockReviews.reduce((s, r) => s + r.rating, 0) / mockReviews.length).toFixed(1);
    const dist = [5, 4, 3, 2, 1].map(r => ({ r, count: mockReviews.filter(rv => rv.rating === r).length }));

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Reviews" subtitle="What renters say about your listings" />
            <div className="p-6 space-y-5">
                {/* Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <div className="flex gap-8 items-center">
                        <div className="text-center">
                            <p className="text-5xl font-black text-stone-900">{avgRating}</p>
                            <Stars rating={parseFloat(avgRating)} />
                            <p className="text-sm text-stone-400 mt-1">{mockReviews.length} reviews</p>
                        </div>
                        <div className="flex-1 space-y-2">
                            {dist.map(({ r, count }) => (
                                <div key={r} className="flex items-center gap-3">
                                    <span className="text-xs text-stone-500 w-3">{r}</span>
                                    <div className="flex-1 bg-stone-100 rounded-full h-2 overflow-hidden">
                                        <div className="bg-amber-400 h-2 rounded-full transition-all" style={{ width: `${(count / mockReviews.length) * 100}%` }} />
                                    </div>
                                    <span className="text-xs text-stone-400 w-3">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Review Cards */}
                <div className="space-y-4">
                    {mockReviews.map(r => (
                        <div key={r.id} className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5">
                            <div className="flex items-start gap-3">
                                <Avatar initials={r.avatar} size="md" color="bg-stone-600" />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-semibold text-stone-800">{r.renter}</p>
                                        <span className="text-stone-300">·</span>
                                        <p className="text-xs text-stone-400">{r.listing}</p>
                                        <span className="ml-auto text-xs text-stone-400">{r.date}</span>
                                    </div>
                                    <div className="mt-1.5"><Stars rating={r.rating} /></div>
                                    <p className="text-sm text-stone-600 mt-2 leading-relaxed">{r.comment}</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <button className="text-xs text-stone-400 hover:text-stone-600 flex items-center gap-1">
                                            👍 Helpful ({r.helpful})
                                        </button>
                                        <button onClick={() => setShowReply(s => ({ ...s, [r.id]: !s[r.id] }))}
                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                                            {r.reply ? "Edit reply" : "Reply"}
                                        </button>
                                    </div>

                                    {r.reply && !showReply[r.id] && (
                                        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                            <p className="text-xs font-semibold text-amber-700 mb-1">Your reply</p>
                                            <p className="text-sm text-stone-600">{r.reply}</p>
                                        </div>
                                    )}

                                    {showReply[r.id] && (
                                        <div className="mt-3">
                                            <textarea value={replyText[r.id] || r.reply}
                                                onChange={e => setReplyText(t => ({ ...t, [r.id]: e.target.value }))}
                                                rows={3} placeholder="Write a public reply..."
                                                className="w-full border border-stone-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none" />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={() => setShowReply(s => ({ ...s, [r.id]: false }))}
                                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium py-2 rounded-lg transition-colors">
                                                    Post Reply
                                                </button>
                                                <button onClick={() => setShowReply(s => ({ ...s, [r.id]: false }))}
                                                    className="px-4 border border-stone-200 text-stone-600 text-sm rounded-lg hover:bg-stone-50">
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
