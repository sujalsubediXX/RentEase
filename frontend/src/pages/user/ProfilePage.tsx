function ProfilePage() {
  const stats = [
    { label: "Active Rentals", value: "3", icon: "📦" },
    { label: "Completed", value: "24", icon: "✅" },
    { label: "Wishlist", value: "5", icon: "❤️" },
    { label: "Reviews", value: "18", icon: "⭐" },
  ];

  const rentals = [
    { name: "Sony A7III Camera", status: "active", dates: "Jun 10 – Jun 13", price: 2550, image: "📷" },
    { name: "4-Person Tent", status: "active", dates: "Jun 15 – Jun 20", price: 2000, image: "⛺" },
    { name: "DJI Drone Mini 3", status: "completed", dates: "May 20 – May 23", price: 3600, image: "🚁" },
    { name: "Projector 4K", status: "completed", dates: "May 5 – May 6", price: 750, image: "📽️" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 mt-12">
      {/* Profile Header */}
      <div className="bg-linear-to-br from-stone-900 to-stone-800 rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-amber-500 flex items-center justify-center text-stone-900 font-black text-3xl shadow-lg">
            SR
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Sujal Rai</h1>
            <p className="text-stone-400 text-sm mt-0.5">sujal@email.com · Kathmandu, Nepal</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <span className="bg-amber-500/20 text-amber-400 text-xs px-3 py-1 rounded-full font-medium border border-amber-500/30">
                ✓ KYC Verified
              </span>
              <span className="bg-green-500/20 text-green-400 text-xs px-3 py-1 rounded-full font-medium border border-green-500/30">
                ● Active Member
              </span>
              <span className="bg-stone-700 text-stone-300 text-xs px-3 py-1 rounded-full font-medium">
                Member since Jan 2024
              </span>
            </div>
          </div>
          <button className="bg-amber-500 text-stone-900 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-amber-400 transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-stone-200 rounded-2xl p-5 text-center hover:border-amber-300 hover:shadow-md transition-all">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-stone-900">{s.value}</div>
            <div className="text-xs text-stone-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Rental History */}
      <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex justify-between items-center">
          <h2 className="font-bold text-stone-900 text-lg">Rental History</h2>
          <button className="text-amber-600 text-sm font-medium hover:text-amber-700">View All</button>
        </div>
        <div className="divide-y divide-stone-100">
          {rentals.map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-stone-50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-2xl shrink-0">
                {r.image}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-stone-900 text-sm truncate">{r.name}</p>
                <p className="text-xs text-stone-500 mt-0.5">{r.dates}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-stone-900 text-sm">Rs. {r.price.toLocaleString()}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  r.status === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-stone-100 text-stone-500"
                }`}>
                  {r.status === "active" ? "● Active" : "✓ Done"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;