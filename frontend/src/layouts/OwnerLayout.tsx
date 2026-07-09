
import { Outlet } from "react-router-dom"
import { SidebarProvider } from "../contexts/SidebarContext"
import { OwnerSidebar } from "../components/owner/OwnerSidebar"
import { ToastContainer } from "react-toastify";
export const OwnerLayout = () => {
    return (
        <SidebarProvider>
            <div className="flex bg-stone-50 ">
                    <ToastContainer  />

                <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Nunito:wght@400;500;600;700&display=swap');
                * { font-family: 'Nunito', sans-serif; }
                h1,h2,.font-display { font-family: 'Syne', sans-serif; }
                ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #e5e5e5; border-radius: 999px; }
                  `}</style>
                <OwnerSidebar  />
                <Outlet />
            </div>

        </SidebarProvider>


    )
}
