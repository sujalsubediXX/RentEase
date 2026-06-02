import { Outlet } from 'react-router-dom';
import { SidebarProvider } from "../contexts/SidebarContext";
import { Topbar } from '../components/admin/Topbar';
import { AdminSidebar } from '../components/admin/AdminSidebar';
export const AdminLayout = () => {
  return (
    <>
     <SidebarProvider>
       <div className="flex h-screen bg-stone-950 font-sans overflow-hidden">
         <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar  />
        <main className="flex-1 overflow-y-auto">
         <Outlet />
        </main>
      </div>

    </div>
     </SidebarProvider>
    </>
  )
}
