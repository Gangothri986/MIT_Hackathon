
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getCurrentUser());

  const [isAuthenticated, setIsAuthenticated] = useState(
    () => authService.isAuthenticated()
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
  }, []);

  // LOGIN
  const login = async (email, password, remember = true) => {
    setLoading(true);

    try {
      const result = await authService.login(email, password, remember);

      setUser(result.user);
      setIsAuthenticated(true);

      return result;
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP
  const signup = async (data) => {
    setLoading(true);

    try {
      const result = await authService.signup(data);

      setUser(result.user);
      setIsAuthenticated(true);

      return result;
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    authService.logout();

    setUser(null);
    setIsAuthenticated(false);
  };

  // UPDATE PROFILE IN MONGODB
  const updateProfile = async (data) => {
    setLoading(true);

    try {
      const updated = await authService.updateUserProfile(data);

      setUser(updated);

      return updated;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
