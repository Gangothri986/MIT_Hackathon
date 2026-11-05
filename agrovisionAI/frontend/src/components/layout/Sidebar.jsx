import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sprout,
  ScanEye,
  Activity,
  CloudSun,
  ShieldAlert,
  BarChart3,
  History,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { path: '/', label: 'Overview', icon: LayoutDashboard },
  { path: '/plants', label: 'My Plants', icon: Sprout },
  { path: '/analysis', label: 'Plant Analysis', icon: ScanEye },
  { path: '/disease', label: 'Disease Detection', icon: Activity },
  { path: '/predictions', label: 'Growth Predictions', icon: TrendingUp },
  { path: '/weather', label: 'Weather Intelligence', icon: CloudSun },
  { path: '/risk-assessment', label: 'Risk Assessment', icon: ShieldAlert },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/history', label: 'Monitoring History', icon: History },
  { path: '/profile', label: 'My Profile', icon: User },
];

export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-[#0B241B] border-r border-[#164433] text-slate-200 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[#164433]/70">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#16A36A] to-[#0B3B26] text-white shadow-md shadow-[#16A36A]/20 shrink-0">
            <Cpu className="w-5 h-5 text-[#B7E46A]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-display font-bold text-base text-white tracking-tight leading-tight flex items-center gap-1.5">
                AgroVision <span className="text-[#B7E46A] text-xs font-mono font-normal uppercase">AI</span>
              </span>
              <span className="text-[11px] text-emerald-300/80 truncate">
                Smart Farming Platform
              </span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg text-emerald-300 hover:text-white hover:bg-[#123B2A] transition-colors focus-visible:outline-none"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
                  isActive
                    ? 'bg-[#16A36A] text-white shadow-sm font-semibold'
                    : 'text-emerald-100/80 hover:bg-[#123B2A] hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {!isCollapsed && (
                <span className="truncate flex-1">{item.label}</span>
              )}

              {/* Tooltip on collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-lg">
                  {item.label}
                </div>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom User Area */}
      <div className="p-3.5 border-t border-[#164433]/70 bg-[#081b14]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between">
            <div
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2.5 min-w-0 cursor-pointer hover:opacity-90"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'RK'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Ramesh Kumar'}</p>
                <p className="text-[10px] text-emerald-400 truncate">{user?.farmName || 'Green Valley Farm'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-[#123B2A] rounded-md transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-400 rounded-md transition-colors"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
