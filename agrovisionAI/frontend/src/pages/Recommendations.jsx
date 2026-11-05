import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  AlertTriangle,
  ArrowRight,
  Droplets,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { usePlant } from '../context/PlantContext';

export default function Recommendations() {
  const { recommendations, completeRecommendation } = usePlant();
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [cropFilter, setCropFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('Active');

  const filtered = recommendations.filter((rec) => {
    if (priorityFilter !== 'All' && rec.priority !== priorityFilter) return false;
    if (cropFilter !== 'All' && rec.crop !== cropFilter) return false;
    if (statusFilter === 'Active' && rec.completed) return false;
    if (statusFilter === 'Completed' && !rec.completed) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-xs font-semibold text-emerald-800 tracking-wide uppercase">
            Prescriptive Agronomy Engine
          </span>
          <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
            AI Next Best Action Directives
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Autonomous decision engine synthesizing continuous CNN image diagnostics, phenological stage transitions, and 7-day microclimate forecasts into concrete farming tasks.
          </p>
        </div>

        {/* Counter badge */}
        <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-white border border-slate-200 self-start shadow-2xs">
          <span>Active Tasks: </span>
          <strong className="text-emerald-700">
            {recommendations.filter((r) => !r.completed).length}
          </strong>{' '}
          / {recommendations.length}
        </div>
      </div>

      {/* Filter Tabs Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
        {/* Status Filter */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {['Active', 'Completed', 'All'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                statusFilter === s
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Priority & Crop Selectors */}
        <div className="flex items-center gap-2 text-xs">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>

          <select
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-medium"
          >
            <option value="All">All Crops</option>
            <option value="Tomato">Tomato</option>
            <option value="Chilli">Chilli</option>
            <option value="Paddy">Paddy</option>
            <option value="Multi-Crop">Multi-Crop</option>
          </select>
        </div>
      </div>

      {/* Recommendation Action Cards List */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered.map((rec) => (
            <div
              key={rec.id}
              className={`p-6 rounded-2xl border transition-all ${
                rec.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : rec.priority === 'High'
                  ? 'bg-white border-2 border-red-500/30 shadow-xs'
                  : 'bg-white border border-slate-200 shadow-2xs'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full ${
                        rec.priority === 'High'
                          ? 'bg-red-100 text-red-800'
                          : rec.priority === 'Medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rec.priority} Priority
                    </span>
                    <span className="text-xs font-semibold text-slate-700">{rec.plantName}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-emerald-700 font-mono">{rec.stage}</span>
                    <span className="text-slate-400">·</span>
                    <span className="text-xs text-slate-500">{rec.category}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                    <strong>Detection Basis:</strong> {rec.reason}
                  </div>

                  <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs text-emerald-950 font-medium leading-relaxed">
                    <strong>Prescribed Action:</strong> {rec.suggestedAction}
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 pt-2 sm:pt-0">
                  <span className="text-[11px] text-slate-400 font-mono">{rec.timestamp}</span>

                  <button
                    onClick={() => completeRecommendation(rec.id)}
                    className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                      rec.completed
                        ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        : 'bg-[#123B2A] hover:bg-[#16A36A] text-white shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{rec.completed ? 'Re-open Directive' : 'Mark Implemented'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-base text-slate-900">No Directives in View</h3>
            <p className="text-xs text-slate-500">
              All tasks matching current filter criteria have been addressed.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
