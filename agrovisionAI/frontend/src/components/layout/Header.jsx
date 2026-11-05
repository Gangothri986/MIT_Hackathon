import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Bot,
  FileDown,
  CloudSun,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROUTE_NAMES = {
  '/': 'Farm Overview & Field Telemetry',
  '/plants': 'My Plants & Crop Registry',
  '/analysis': 'AI Growth Stage Detection',
  '/disease': 'Plant Disease Intelligence',
  '/predictions': 'Crop Growth Predictions & Milestones',
  '/weather': 'Weather Intelligence & Forecast',
  '/risk-assessment': 'Environmental Risk Assessment',
  '/analytics': 'Farm Analytics & Growth Trends',
  '/history': 'Plant Growth History & Comparison',
  '/profile': 'My Farm Profile',
};

export default function Header({ onOpenAssistant, onOpenExportReport, isSidebarCollapsed }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const title = ROUTE_NAMES[location.pathname] || 'AgroVision AI';

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-6 flex items-center justify-between gap-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {/* Zone 1: Breadcrumb & Contextual Title */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>AgroVision AI</span>
            <span aria-hidden="true">/</span>
            <span className="text-emerald-700 font-semibold">{title.split(' ')[0]}</span>
          </div>
          <h1 className="text-sm md:text-base font-bold text-slate-900 tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Zone 2: Farm Weather Indicator */}
      <div className="hidden lg:flex items-center gap-3 text-xs">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100/80 text-emerald-900">
          <CloudSun className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Farm Weather:</span>
          <span className="font-mono tabular-nums">29.4°C</span>
          <span className="text-slate-400">·</span>
          <span>Humidity: <strong className="font-mono tabular-nums">68%</strong></span>
          <span className="text-slate-400">·</span>
          <span>Soil Moisture: <strong className="font-mono tabular-nums">32%</strong></span>
        </div>
      </div>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-emerald-950 bg-[#B7E46A] hover:bg-[#a5d852] active:scale-95 rounded-lg transition-all shadow-sm whitespace-nowrap"
          title="Open AI Agriculture Assistant"
        >
          <Bot className="w-4 h-4 text-[#0B241B]" />
          <span className="hidden sm:inline">Ask AgroBot</span>
        </button>

        <button
          onClick={onOpenExportReport}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors whitespace-nowrap"
          title="Export Plant Report"
        >
          <FileDown className="w-4 h-4 text-slate-600" />
          <span className="hidden md:inline">Print Report</span>
        </button>

        {/* User Profile Mini Trigger */}
        <button
          onClick={() => navigate('/profile')}
          className="flex items-center gap-2 p-1 hover:bg-slate-100 rounded-lg transition-colors"
          title="View Profile"
        >
          <div className="w-8 h-8 rounded-full bg-[#123B2A] text-[#B7E46A] font-bold text-xs flex items-center justify-center border border-emerald-700">
            {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
          </div>
        </button>
      </div>
    </header>
  );
}
