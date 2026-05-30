import { useState } from "react";
import {TopBar} from "../../components/owner/TopBar";
import { Avatar } from "../../components/owner/Avatar";
import { Stars } from "../../components/owner/Stars";
import { Edit } from "lucide-react";
interface NotificationSettings {
    bookingReq: boolean;
    messages: boolean;
    reviews: boolean;
    payments: boolean;
    promos: boolean;
}



export const Settings = () => {
    const [notif, setNotif] = useState<NotificationSettings>({
        bookingReq: true, messages: true, reviews: true, payments: true, promos: false,
    });

    const toggleNotif = (key: keyof NotificationSettings) => {
        setNotif(n => ({ ...n, [key]: !n[key] }));
    };

    return (
        <div className="flex-1 overflow-y-auto bg-stone-50">
            <TopBar title="Settings" subtitle="Manage your account and preferences" />
            <div className="p-6 max-w-2xl mx-auto space-y-5">
                {/* Profile */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Profile</h3>
                    <div className="flex items-center gap-4 mb-5">
                        <div className="relative">
                            <Avatar initials="SK" size="lg" color="bg-amber-600" />
                            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm">
                                <Edit size={10} className="text-stone-500" />
                            </button>
                        </div>
                        <div>
                            <p className="font-bold text-stone-800">Suresh Kumar</p>
                            <p className="text-sm text-stone-400">Owner since Jan 2025</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Stars rating={4.7} />
                                <span className="text-xs text-stone-400">4.7 avg rating</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            ["Full Name", "Suresh Kumar"],
                            ["Phone", "+977 98XXXXXXXX"],
                            ["Email", "suresh@email.com"],
                            ["Location", "Kathmandu, Nepal"],
                        ].map(([l, v]) => (
                            <div key={l}>
                                <label className="block text-xs font-medium text-stone-500 mb-1.5">{l}</label>
                                <input defaultValue={v}
                                    className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                            </div>
                        ))}
                    </div>
                    <button className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors">
                        Save Changes
                    </button>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Notifications</h3>
                    <div className="space-y-3">
                        {[
                            { key: "bookingReq", label: "New booking requests" },
                            { key: "messages", label: "New messages from renters" },
                            { key: "reviews", label: "New reviews on listings" },
                            { key: "payments", label: "Payment confirmations" },
                            { key: "promos", label: "Promotions and tips" },
                        ].map(({ key, label }) => (
                            <div key={key} className="flex items-center justify-between py-2">
                                <span className="text-sm text-stone-700">{label}</span>
                                <button onClick={() => toggleNotif(key as keyof NotificationSettings)}
                                    className={`w-11 h-6 rounded-full transition-colors relative ${notif[key as keyof NotificationSettings] ? "bg-amber-600" : "bg-stone-200"}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${notif[key as keyof NotificationSettings] ? "left-6" : "left-1"}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payout */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6">
                    <h3 className="font-bold text-stone-800 mb-4">Payout Settings</h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Bank Name</label>
                            <input defaultValue="Nabil Bank"
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Account Number</label>
                            <input defaultValue="••••••••7842"
                                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-stone-500 mb-1.5">Payout Schedule</label>
                            <select className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-400">
                                <option>Weekly</option><option>Bi-weekly</option><option>Monthly</option>
                            </select>
                        </div>
                    </div>
                    <button className="mt-4 px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-xl transition-colors">
                        Update Payout Info
                    </button>
                </div>

                {/* Danger */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-6">
                    <h3 className="font-bold text-red-600 mb-3">Danger Zone</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-stone-800">Delete Account</p>
                            <p className="text-xs text-stone-400">This will permanently remove all your data</p>
                        </div>
                        <button className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-sm font-medium rounded-xl transition-colors">
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
