import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Viewport Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Navbar onMobileMenuToggle={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
