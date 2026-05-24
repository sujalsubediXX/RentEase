import { Footer } from "../components/Footer"
import Header from "../components/Header"
import { Outlet } from "react-router-dom"
export const UserLayout = () => {
    return (

        <div className="bg-white text-gray-900 font-sans overflow-x-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap');
        .font-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .hero-grid-bg {
          background-image: linear-gradient(rgba(212,146,42,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212,146,42,0.08) 1px, transparent 1px);
          background-size: 60px 60px;
        }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .anim-0 { animation: fadeUp 0.6s 0s ease both; }
        .anim-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .anim-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .anim-3 { animation: fadeUp 0.6s 0.3s ease both; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #f9f6f1; }
        ::-webkit-scrollbar-thumb { background: #e0d5c0; border-radius: 99px; }
      `}</style>

            <Header />
            <Outlet />
            <Footer />
        </div>

    )
}
