import { DollarSign, Zap, Globe } from "lucide-react";

export const RevenuePage: React.FC = () => (
  <div className="p-6 space-y-4">
    <h1 className="text-lg font-bold text-white">Revenue Overview</h1>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: "Total Earnings (All Time)", value: "Rs 4,82,950", icon: DollarSign, color: "amber" },
        { label: "Platform Commission (15%)", value: "Rs 72,442", icon: Zap, color: "emerald" },
        { label: "Owner Payouts", value: "Rs 4,10,508", icon: Globe, color: "sky" },
      ].map(c => (
        <div key={c.label} className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${c.color === "amber" ? "bg-amber-500/15 text-amber-400" : c.color === "emerald" ? "bg-emerald-500/15 text-emerald-400" : "bg-sky-500/15 text-sky-400"}`}>
            <c.icon size={18} />
          </div>
          <p className="text-xs text-stone-500 uppercase tracking-wider">{c.label}</p>
          <p className="text-2xl font-bold text-white mt-1">{c.value}</p>
        </div>
      ))}
    </div>

    <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800">
      <h2 className="text-sm font-semibold text-white mb-5">Monthly Revenue (2025)</h2>
      <div className="flex items-end gap-3 h-40">
        {[38, 52, 45, 68, 74, 91, 65, 80, 55, 70, 85, 100].map((v, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
            <div
              className="w-full bg-amber-500 rounded-t-lg transition-all hover:bg-amber-400 cursor-pointer"
              style={{ height: `${v}%` }}
              title={`Month ${i + 1}: Rs ${Math.round(v * 500)}`}
            />
            <span className="text-[10px] text-stone-600">
              {["J","F","M","A","M","J","J","A","S","O","N","D"][i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  </div>
);
