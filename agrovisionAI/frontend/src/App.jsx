import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { PlantProvider } from './context/PlantContext.jsx';
import AppLayout from './components/layout/AppLayout.jsx';

import Dashboard from './pages/Dashboard.jsx';
import MyPlants from './pages/MyPlants.jsx';
import PlantAnalysis from './pages/PlantAnalysis.jsx';
import DiseaseDetection from './pages/DiseaseDetection.jsx';
import GrowthPredictions from './pages/GrowthPredictions.jsx';
import WeatherIntelligence from './pages/WeatherIntelligence.jsx';
import RiskAssessment from './pages/RiskAssessment.jsx';
import Analytics from './pages/Analytics.jsx';
import History from './pages/History.jsx';
import Profile from './pages/Profile.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F8F2]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-emerald-950 font-display">Loading AgroVision AI...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <PlantProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Farmer App Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="plants" element={<MyPlants />} />
              <Route path="analysis" element={<PlantAnalysis />} />
              <Route path="disease" element={<DiseaseDetection />} />
              <Route path="predictions" element={<GrowthPredictions />} />
              <Route path="weather" element={<WeatherIntelligence />} />
              <Route path="risk-assessment" element={<RiskAssessment />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="history" element={<History />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </PlantProvider>
    </AuthProvider>
  );
}
