export const SettingsPage: React.FC = () => (
  <div className="p-6 space-y-4 max-w-2xl">
    <h1 className="text-lg font-bold text-white">Settings</h1>
    {[
      { section: "Platform", fields: [{ label: "Commission Rate (%)", value: "15" }, { label: "Max Listings Per Owner", value: "50" }] },
      { section: "Notifications", fields: [{ label: "Alert Email", value: "admin@rentease.com" }] },
    ].map(s => (
      <div key={s.section} className="bg-stone-900 rounded-2xl p-5 border border-stone-800 space-y-4">
        <h2 className="text-sm font-semibold text-white">{s.section}</h2>
        {s.fields.map(f => (
          <div key={f.label}>
            <label className="text-xs text-stone-500 block mb-1.5">{f.label}</label>
            <input
              defaultValue={f.value}
              className="w-full bg-stone-800 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-300 outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        ))}
      </div>
    ))}
    <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-white rounded-xl text-sm font-semibold transition-colors">
      Save Changes
    </button>
  </div>
);
