import React, { useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Sprout,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || 'Ramesh Kumar',
    email: user?.email || 'ramesh.farmer@agrovision.in',
    farmName: user?.farmName || 'Green Valley Farm',
    location: user?.location || 'Southern Agricultural Region',
    farmSize: user?.farmSize || '5 Acres',
    cropsMonitored: user?.cropsMonitored ? user.cropsMonitored.join(', ') : 'Tomato, Chilli, Paddy',
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      cropsMonitored: formData.cropsMonitored.split(',').map((c) => c.trim()),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 tracking-tight">
          My Farm Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Manage your farmer details, farm plots, and primary crops.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile details saved successfully!</span>
        </div>
      )}

      {/* Profile Card & Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Banner */}
        <div className="p-6 bg-gradient-to-r from-[#0B241B] to-[#123B2A] text-white flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#16A36A] text-[#B7E46A] text-2xl font-bold flex items-center justify-center border-2 border-emerald-400/40 shadow-md">
            {formData.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold font-display text-white">{formData.name}</h2>
            <p className="text-xs text-emerald-300 font-medium">{formData.farmName}</p>
            <p className="text-[11px] text-emerald-400/80">{formData.location}</p>
          </div>
        </div>

        {/* Simple Form Fields */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Email / Phone</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Farm Name</label>
              <div className="relative">
                <Sprout className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Farm Size</label>
              <input
                type="text"
                placeholder="e.g. 5 Acres"
                value={formData.farmSize}
                onChange={(e) => setFormData({ ...formData, farmSize: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Village / Region</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">Primary Crops Grown (comma separated)</label>
              <input
                type="text"
                value={formData.cropsMonitored}
                onChange={(e) => setFormData({ ...formData, cropsMonitored: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-[#123B2A] hover:bg-[#16A36A] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#B7E46A]" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
