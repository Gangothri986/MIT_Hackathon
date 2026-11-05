import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '../services/authService';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email or phone.');
      return;
    }
    try {
      setLoading(true);
      await authService.resetPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError('Failed to send recovery link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F7F8F2]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Sign In</span>
        </Link>

        {submitted ? (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold font-display text-slate-900">Reset Link Sent</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have sent password recovery instructions to <strong className="text-slate-900">{email}</strong>.
            </p>
            <Link
              to="/login"
              className="inline-block mt-4 px-4 py-2 bg-[#123B2A] text-white text-xs font-semibold rounded-xl hover:bg-[#16A36A] transition-colors"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-bold font-display text-slate-900">Reset Your Password</h2>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Enter your email or phone to receive instructions to reset your password.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email or Phone</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@agrovision.in"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-emerald-600 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#123B2A] hover:bg-[#16A36A] text-white text-xs font-semibold rounded-xl transition-all shadow-sm"
              >
                {loading ? 'Sending Link...' : 'Send Reset Link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
