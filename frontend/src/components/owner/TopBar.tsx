import {  ChevronDown, Menu } from 'lucide-react'
import { useSidebar } from '../../contexts/SidebarContext';
import { useAuth } from '../../hooks/useAuth';




export const TopBar = ({title, subtitle}: {title?:string, subtitle?:string}) => {

  const { toggleSidebar } = useSidebar();
  const { user } = useAuth(); // Get user from auth context


  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "U";
    const name = user.fullName || user.email || "User";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get user display name
  const getUserName = () => {
    if (!user) return "Guest";
    return user.fullName || user.email?.split('@')[0] || "User";
  };

  // Get user role display
  const getUserRole = () => {
    if (!user) return "Guest";
    return user.role === 'owner' ? 'Owner Account' : 
           user.role === 'admin' ? 'Admin Account' : 
           'User Account';
  };

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden">

        <header className="h-16 bg-white border-b border-stone-100 flex items-center gap-4 px-6 shrink-0">
          <button 
            onClick={toggleSidebar} 
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div>
            <h1 className="text-md font-bold text-stone-900">{title}</h1>
            {subtitle && <p className="text-stone-500 text-sm mt-0.5">{subtitle}</p>}
          </div>

          <div className="ml-auto flex items-center gap-2">
       
          

            {/* Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-stone-100">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm font-bold">
                {getUserInitials()}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-stone-800 leading-none">{getUserName()}</p>
                <p className="text-xs text-stone-400 mt-0.5">{getUserRole()}</p>
              </div>
              <ChevronDown size={14} className="text-stone-400" />
            </div>
          </div>
        </header>
      </div>
    </>
  );
};