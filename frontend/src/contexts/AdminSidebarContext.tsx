import React, { createContext, useContext, useState, } from 'react';
import type {ReactNode } from 'react';

interface SidebarContextType {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const AdminSidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const setSidebarOpen = (open: boolean) => setIsSidebarOpen(open);

  return (
    <AdminSidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, setSidebarOpen }}>
      {children}
    </AdminSidebarContext.Provider>
  );
};

export const useSidebar = (): SidebarContextType => {
  const context = useContext(AdminSidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};