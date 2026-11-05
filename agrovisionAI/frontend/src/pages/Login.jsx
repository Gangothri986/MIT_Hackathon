import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Cpu, ArrowRight, CheckCircle2, Sprout } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { IMAGES } from '../assets/images';

export default function Login() {
  const [email, setEmail] = useState('ramesh.farmer@agrovision.in');
  const [password, setPassword] = useState('farmer123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password, rememberMe);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = async () => {
    setEmail('ramesh.farmer@agrovision.in');
    setPassword('farmer123');
    try {
      setLoading(true);
      await login('ramesh.farmer@agrovision.in', 'farmer123', true);
      navigate('/');
    } catch (err) {
      setError('Instant sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8F2]">
      {/* Left Column: Visual Agriculture Showcase */}
      <div className="relative md:w-1/2 lg:w-7/12 min-h-[300px] md:min-h-screen bg-[#0B241B] flex flex-col justify-between p-8 lg:p-12 text-white overflow-hidden">
        <img
          src={IMAGES.hero}
          alt="Smart agricultural crop field at sunrise"
          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B241B] via-[#0B241B]/70 to-[#0B241B]/40" />

        {/* Brand Lockup */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#16A36A] flex items-center justify-center text-white shadow-md">
            <Sprout className="w-5 h-5 text-[#B7E46A]" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-white tracking-tight">AgroVision AI</h1>
            <p className="text-[11px] text-emerald-300">Intelligent Crop & Growth Monitoring</p>
          </div>
        </div>

        {/* Farmer Editorial Message */}
        <div className="relative z-10 my-auto py-10 max-w-lg">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#B7E46A] mb-3 block">
            For Farmers & Growers
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-white leading-snug tracking-tight">
            Understand your plants today. Predict their growth tomorrow.
          </h2>
          <p className="mt-4 text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Take a photo of your crops to identify their growth stage, spot diseases early, and get simple weather-based guidance to protect your harvest.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs text-emerald-200">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7E46A]" />
              <span>Plant Growth Stage Detection</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7E46A]" />
              <span>Early Disease Diagnostics</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-[#B7E46A]" />
              <span>Weather & Harvest Outlook</span>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-xs text-emerald-400/80 flex items-center justify-between border-t border-emerald-900/60 pt-4">
          <span>AgroVision AI — Simple Smart Farming</span>
          <span className="font-mono">v2.0</span>
        </div>
      </div>

      {/* Right Column: Simple Farmer Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <div className="mb-6">
            <h2 className="text-xl font-bold font-display text-slate-900 tracking-tight">Farmer Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">Access your farm plots and plant health records.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email or Phone Number</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ramesh.farmer@agrovision.in"
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-[11px] text-emerald-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                  required
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 border-slate-300"
                />
                <span>Remember me on this phone/computer</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-[#123B2A] hover:bg-[#16A36A] active:scale-[0.99] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Sign-In */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={handleQuickDemoLogin}
              className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-700" />
              <span>1-Click Instant Sign-In (Ramesh Kumar)</span>
            </button>
          </div>

          <div className="mt-6 text-center text-xs text-slate-500">
            New to AgroVision?{' '}
            <Link to="/signup" className="text-emerald-700 font-semibold hover:underline">
              Create a free farmer account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
