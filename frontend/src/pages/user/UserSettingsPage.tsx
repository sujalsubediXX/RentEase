import  { useState } from "react";

function UserSettingsPage() {
  const [notifications, setNotifications] = useState({
    bookingUpdates: true,
    newMessages: true,
    promotions: false,
    reminders: true,
  });
  const [privacy, setPrivacy] = useState({
    showProfile: true,
    showRentals: false,
  });
  const [activeTab, setActiveTab] = useState<"account" | "notifications" | "privacy" | "kyc">("account");

  const tabs: { id: typeof activeTab; label: string; icon: string }[] = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "kyc", label: "KYC Status", icon: "✅" },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${checked ? "bg-amber-500" : "bg-stone-200"}`}
    >
      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 mt-12">
      <h1 className="text-3xl font-bold text-stone-900 font-serif mb-8">Settings</h1>

      <div className="flex flex-col sm:flex-row gap-6">
        {/* Tabs */}
        <div className="sm:w-52 flex sm:flex-col gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all text-left ${
                activeTab === t.id
                  ? "bg-stone-900 text-amber-400"
                  : "text-stone-600 hover:bg-stone-100"
              }`}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 bg-white border border-stone-200 rounded-2xl overflow-hidden">
          {activeTab === "account" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">Account Information</h2>
              <div className="space-y-4">
                {[
                  { label: "Full Name", value: "Sujal Rai", type: "text" },
                  { label: "Email Address", value: "sujal@email.com", type: "email" },
                  { label: "Phone Number", value: "+977-9812345678", type: "tel" },
                  { label: "City", value: "Kathmandu", type: "text" },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5">{f.label}</label>
                    <input
                      type={f.type}
                      defaultValue={f.value}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  </div>
                ))}
              </div>
              <button className="mt-6 bg-amber-500 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-amber-400 transition-colors text-sm">
                Save Changes
              </button>

              <div className="mt-8 pt-8 border-t border-stone-100">
                <h3 className="font-bold text-stone-900 mb-4">Change Password</h3>
                <div className="space-y-3">
                  {["Current Password", "New Password", "Confirm Password"].map((f) => (
                    <input
                      key={f}
                      type="password"
                      placeholder={f}
                      className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition-all"
                    />
                  ))}
                </div>
                <button className="mt-4 border border-stone-900 text-stone-900 font-semibold px-6 py-2.5 rounded-xl hover:bg-stone-900 hover:text-white transition-colors text-sm">
                  Update Password
                </button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">Notification Preferences</h2>
              <div className="space-y-1">
                {(
                  [
                    { key: "bookingUpdates", label: "Booking Updates", desc: "Status changes for your rentals" },
                    { key: "newMessages", label: "New Messages", desc: "Messages from item owners" },
                    { key: "promotions", label: "Promotions & Offers", desc: "Deals and seasonal discounts" },
                    { key: "reminders", label: "Return Reminders", desc: "Alerts before items are due" },
                  ] as { key: keyof typeof notifications; label: string; desc: string }[]
                ).map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{n.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[n.key]}
                      onChange={() => setNotifications((p) => ({ ...p, [n.key]: !p[n.key] }))}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">Privacy Settings</h2>
              <div className="space-y-1">
                {(
                  [
                    { key: "showProfile", label: "Public Profile", desc: "Allow others to view your profile" },
                    { key: "showRentals", label: "Show Rental History", desc: "Display your past rentals publicly" },
                  ] as { key: keyof typeof privacy; label: string; desc: string }[]
                ).map((n) => (
                  <div key={n.key} className="flex items-center justify-between py-4 border-b border-stone-100 last:border-0">
                    <div>
                      <p className="font-medium text-stone-900 text-sm">{n.label}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{n.desc}</p>
                    </div>
                    <Toggle
                      checked={privacy[n.key]}
                      onChange={() => setPrivacy((p) => ({ ...p, [n.key]: !p[n.key] }))}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl">
                <h3 className="font-semibold text-red-700 text-sm mb-1">Danger Zone</h3>
                <p className="text-xs text-red-500 mb-3">These actions are permanent and cannot be undone.</p>
                <button className="text-red-600 border border-red-200 text-xs font-semibold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === "kyc" && (
            <div className="p-6">
              <h2 className="font-bold text-stone-900 text-lg mb-6">KYC Verification Status</h2>
              <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-lg shrink-0">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-green-800">Fully Verified</p>
                  <p className="text-sm text-green-600 mt-0.5">Your account is verified and ready to rent items.</p>
                  <p className="text-xs text-green-500 mt-1">Verified on March 15, 2024</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: "Citizenship / National ID", status: "verified", icon: "🪪" },
                  { label: "Selfie Verification", status: "verified", icon: "🤳" },
                  { label: "Phone Number", status: "verified", icon: "📱" },
                  { label: "Email Address", status: "verified", icon: "📧" },
                ].map((d) => (
                  <div key={d.label} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{d.icon}</span>
                      <span className="text-sm font-medium text-stone-700">{d.label}</span>
                    </div>
                    <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">
                      ✓ Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
export default UserSettingsPage;