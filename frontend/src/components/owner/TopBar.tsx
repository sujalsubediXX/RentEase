import { Bell } from "lucide-react";

export const TopBar = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) => (
    <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-stone-100 shrink-0">
        <div>
            <h1 className="text-xl font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="text-stone-500 text-sm mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">
            {actions}
            <button className="relative p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full"></span>
            </button>
        </div>
    </div>
);
