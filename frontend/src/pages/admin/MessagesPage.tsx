const avatarColor = (initials: string) => {
  const colors = [
    "bg-amber-500", "bg-emerald-500", "bg-sky-500",
    "bg-violet-500", "bg-rose-500", "bg-teal-500",
  ];
  return colors[initials.charCodeAt(0) % colors.length];
};
export const MessagesPage: React.FC = () => (
  <div className="p-6 space-y-4">
    <h1 className="text-lg font-bold text-white">Support Messages</h1>
    <div className="space-y-3">
      {[
        { from: "Aarav Sharma", subject: "Payment not received", time: "10 min ago", unread: true, preview: "I completed the booking but the payment hasn't shown in my account yet…" },
        { from: "Sita Rai", subject: "Listing approval delayed", time: "2 hr ago", unread: true, preview: "My listing was submitted 3 days ago but still shows pending…" },
        { from: "Bikash Magar", subject: "Renter damaged my item", time: "Yesterday", unread: false, preview: "I'd like to report that the renter returned my GoPro with a cracked lens…" },
        { from: "Priya Thapa", subject: "Payout discrepancy", time: "2 days ago", unread: false, preview: "The payout I received doesn't match the expected amount for booking B1001…" },
      ].map((m, i) => (
        <div key={i} className={`bg-stone-900 rounded-2xl p-4 border transition-all cursor-pointer hover:border-stone-700 ${m.unread ? "border-amber-500/40" : "border-stone-800"}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl ${avatarColor(m.from.slice(0,2).toUpperCase())} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                {m.from.slice(0,2).toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-semibold ${m.unread ? "text-white" : "text-stone-300"}`}>{m.from}</p>
                <p className={`text-xs ${m.unread ? "text-amber-400" : "text-stone-500"}`}>{m.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {m.unread && <span className="w-2 h-2 bg-amber-500 rounded-full" />}
              <span className="text-xs text-stone-600">{m.time}</span>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-2 ml-11 leading-relaxed truncate">{m.preview}</p>
        </div>
      ))}
    </div>
  </div>
);
