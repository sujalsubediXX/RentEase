import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useSidebar } from '../../contexts/SidebarContext';

export const Topbar = ({ page }: { page?: string }) => {
    const { toggleSidebar } = useSidebar();
    return (
        <header className="h-16 bg-stone-900 border-b border-stone-800 flex items-center px-4 gap-4 shrink-0">
            <button onClick={toggleSidebar} className="text-stone-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-stone-800">
                <Menu size={20} />
            </button>

            <div className="text-sm font-semibold text-white capitalize">{page}</div>

            <div className="flex-1 max-w-sm ml-4">
                {/* <div className="flex items-center gap-2 bg-stone-800 rounded-xl px-3 py-2 text-sm text-stone-500">
                    <Search size={14} />
                    <input
                        className="bg-transparent outline-none text-stone-300 placeholder-stone-600 w-full text-sm"
                        placeholder="Search users, listings…"
                    />
                </div> */}
            </div>

            <div className="ml-auto flex items-center gap-2">
                <button className="relative p-2 rounded-xl text-stone-400 hover:bg-stone-800 hover:text-stone-200 transition-all">
                    <Bell size={18} />
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 transition-all">
                    <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center text-xs font-bold text-white">A</div>
                    <span className="text-sm text-stone-300 font-medium">Admin</span>
                    <ChevronDown size={14} className="text-stone-500" />
                </button>
            </div>
        </header>
    )
};