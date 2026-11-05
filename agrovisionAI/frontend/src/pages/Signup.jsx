import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, MapPin, ArrowRight, CheckCircle2, Sprout, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../assets/images';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    farmName: 'My Farm',
    location: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      await signup(formData);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8F2]">
      {/* Left visual column */}
      <div className="relative md:w-5/12 bg-[#0B241B] flex flex-col justify-between p-8 lg:p-12 text-white overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Agriculture crops"
          className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B241B] via-[#0B241B]/80 to-[#0B241B]/40" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#16A36A] flex items-center justify-center text-[#B7E46A] shadow">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="font-display font-bold text-base text-white">AgroVision AI</span>
        </div>

        <div className="relative z-10 my-auto py-8">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#B7E46A] mb-2 block">
            Easy Farmer Sign-Up
          </span>
          <h2 className="text-2xl lg:text-3xl font-display font-bold text-white tracking-tight leading-snug">
            Simple AI tools to help your crops thrive.
          </h2>
          <p className="mt-3 text-xs text-emerald-100/80 leading-relaxed">
            Monitor growth stages, detect leaf diseases early, and plan irrigation with accurate 7-day weather outlooks.
          </p>
        </div>

        <div className="relative z-10 text-xs text-emerald-400/80 border-t border-emerald-900/60 pt-3">
          Free for farmers and growers
        </div>
      </div>

      {/* Right form column */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display text-slate-900">Create Farmer Account</h2>
            <p className="text-xs text-slate-500 mt-1">Get started in under a minute.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email or Phone Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="name@agrovision.in or +91 9876543210"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Green Valley Farm"
                  value={formData.farmName}
                  onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Village / Location</label>
                <input
                  type="text"
                  placeholder="e.g. North District"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 py-2.5 px-4 bg-[#123B2A] hover:bg-[#16A36A] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
