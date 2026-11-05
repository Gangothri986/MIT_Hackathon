
import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  MapPin,
  Save,
  CheckCircle2,
  Sprout,
  LogOut,
  AlertCircle,
  Loader2,
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    farmName: '',
    location: '',
    farmSize: '',
    cropsMonitored: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState('');

  // Load actual logged-in user details
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setFormData({
      name: user.name || '',
      email: user.email || '',
      farmName: user.farmName || '',
      location: user.location || '',
      farmSize: user.farmSize || '',
      cropsMonitored: Array.isArray(user.cropsMonitored)
        ? user.cropsMonitored.join(', ')
        : '',
    });

    setLoading(false);
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSavedSuccess(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);
    setSavedSuccess(false);
    setError('');

    try {
      const updatedData = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        farmName: formData.farmName.trim(),
        location: formData.location.trim(),
        farmSize: formData.farmSize.trim(),
        cropsMonitored: formData.cropsMonitored
          .split(',')
          .map((crop) => crop.trim())
          .filter(Boolean),
      };

      if (!updatedData.name || !updatedData.email) {
        throw new Error('Name and email are required.');
      }

      // This must call the backend and return its response.
      await updateProfile(updatedData);

      setSavedSuccess(true);
    } catch (err) {
      console.error('Profile update error:', err);

      setError(
        err.response?.data?.message ||
        err.message ||
        'Unable to save profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
        <span className="ml-2 text-sm text-slate-500">
          Loading profile...
        </span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
        <p className="text-sm text-slate-600">
          Please log in to view your profile.
        </p>

        <button
          onClick={() => navigate('/login')}
          className="mt-4 px-5 py-2 bg-[#123B2A] text-white rounded-xl"
        >
          Go to Login
        </button>
      </div>
    );
  }

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

      {/* Success */}

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile updated successfully in your account.</span>
        </div>
      )}

      {/* Error */}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">

        {/* Banner */}

        <div className="p-6 bg-gradient-to-r from-[#0B241B] to-[#123B2A] text-white flex items-center gap-4">

          <div className="w-16 h-16 rounded-2xl bg-[#16A36A] text-[#B7E46A] text-2xl font-bold flex items-center justify-center border-2 border-emerald-400/40 shadow-md">
            {formData.name
              ? formData.name.slice(0, 2).toUpperCase()
              : <User className="w-7 h-7" />}
          </div>

          <div>
            <h2 className="text-xl font-bold font-display text-white">
              {formData.name || 'Your Name'}
            </h2>

            <p className="text-xs text-emerald-300 font-medium">
              {formData.farmName || 'Farm name not added'}
            </p>

            <p className="text-[11px] text-emerald-400/80">
              {formData.location || 'Location not added'}
            </p>
          </div>
        </div>

        {/* Form */}

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Name */}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Name
              </label>

              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Email */}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Farm Name */}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Farm Name
              </label>

              <div className="relative">
                <Sprout className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Farm Size */}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Total Farm Size
              </label>

              <input
                type="text"
                name="farmSize"
                placeholder="e.g. 5 Acres"
                value={formData.farmSize}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Location */}

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Village / Region
              </label>

              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Crops */}

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Primary Crops Grown (comma separated)
              </label>

              <input
                type="text"
                name="cropsMonitored"
                value={formData.cropsMonitored}
                onChange={handleChange}
                placeholder="Tomato, Chilli, Paddy"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Buttons */}

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">

            <button
              type="button"
              onClick={handleLogout}
              disabled={saving}
              className="px-4 py-2 border border-red-200 text-red-700 hover:bg-red-50 font-semibold rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-[#123B2A] hover:bg-[#16A36A] text-white font-semibold rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-[#B7E46A]" />
              )}

              <span>
                {saving ? 'Saving...' : 'Save Changes'}
              </span>
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
