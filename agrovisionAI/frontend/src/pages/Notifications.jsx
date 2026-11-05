import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldAlert,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePlant } from '../context/PlantContext';

export default function Notifications() {
  const { notifications, markNotificationAsRead, markAllNotificationsRead, dismissNotification } =
    usePlant();
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All'); // 'All', 'Unread', 'Critical'

  const filtered = notifications.filter((n) => {
    if (filter === 'Unread') return !n.read;
    if (filter === 'Critical') return n.type === 'critical' || n.type === 'warning';
    return true;
  });

  const getIcon = (type) => {
    switch (type) {
      case 'critical':
        return <ShieldAlert className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBadge = (type) => {
    switch (type) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'success':
        return 'bg-emerald-100 text-emerald-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Real-time Threat & Telemetry Dispatch
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            Notifications & Critical Alerts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Autonomous alert stream generated from continuous CNN classification passes and agro-meteorological risk evaluations.
          </p>
        </div>

        <button
          onClick={markAllNotificationsRead}
          className="px-3.5 py-2 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 rounded-xl transition-colors shadow-2xs self-start"
        >
          Mark All as Read
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-slate-200 rounded-xl shadow-2xs max-w-fit">
        {['All', 'Unread', 'Critical'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === f
                ? 'bg-[#123B2A] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {f} ({f === 'All' ? notifications.length : f === 'Unread' ? notifications.filter(n => !n.read).length : notifications.filter(n => n.type === 'critical' || n.type === 'warning').length})
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markNotificationAsRead(item.id)}
              className={`p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer ${
                item.read
                  ? 'bg-white border-slate-200'
                  : 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${getBadge(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {item.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>

                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono pt-1">
                    <span>{item.timestamp}</span>
                    {item.link && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(item.link);
                        }}
                        className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 font-sans"
                      >
                        <span>Inspect in Module</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!item.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" title="Unread alert" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    dismissNotification(item.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Dismiss notification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">No Notifications</h3>
            <p className="text-xs text-slate-500">Your farm telemetry has no active alerts under this filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
