import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import AgroAssistantModal from '../common/AgroAssistantModal';
import ExportReportModal from '../common/ExportReportModal';

export default function AppLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isExportReportOpen, setIsExportReportOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F7F8F2] text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          isSidebarCollapsed={isSidebarCollapsed}
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenExportReport={() => setIsExportReportOpen(true)}
        />

        <main
          className={`flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto transition-all duration-300 ${
            isSidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <Outlet />
        </main>
      </div>

      {/* AgroBot AI Conversational Assistant */}
      <AgroAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
      />

      {/* Exportable PDF Report Modal */}
      <ExportReportModal
        isOpen={isExportReportOpen}
        onClose={() => setIsExportReportOpen(false)}
      />
    </div>
  );
}
