
import { apiClient } from './api';

// ======================================================
// STORAGE HELPERS
// ======================================================

const USER_STORAGE_KEY = 'agrovision_user_profile';
const TOKEN_STORAGE_KEY = 'agrovision_auth_token';

const saveUserLocally = (user) => {
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
};

const getStoredToken = () => {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    sessionStorage.getItem(TOKEN_STORAGE_KEY)
  );
};

const saveToken = (token, remember = true) => {
  if (remember) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  } else {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
};

// ======================================================
// AUTH SERVICE
// ======================================================

export const authService = {

  // REGISTER
  async signup(userData) {
    try {
      const response = await apiClient.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        farmName: userData.farmName,
        location: userData.location,
        farmSize: userData.farmSize,
      });

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error('Invalid registration response from server.');
      }

      saveToken(token);
      saveUserLocally(user);

      return { user, token };

    } catch (err) {
      console.error('Signup error:', err.response?.data || err);

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Registration failed.'
      );
    }
  },

  // LOGIN
  async login(email, password, remember = true) {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error('Invalid login response from server.');
      }

      saveToken(token, remember);
      saveUserLocally(user);

      return { user, token };

    } catch (err) {
      console.error('Login error:', err.response?.data || err);

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials.'
      );
    }
  },

  // UPDATE PROFILE IN MONGODB
  async updateUserProfile(profileData) {
    try {
      const response = await apiClient.put(
        '/auth/profile',
        profileData
      );

      const updatedUser = response.data.user;

      if (!updatedUser) {
        throw new Error('Updated user was not returned by the server.');
      }

      saveUserLocally(updatedUser);

      return updatedUser;

    } catch (err) {
      console.error('Profile update error:', err.response?.data || err);

      throw new Error(
        err.response?.data?.message ||
        err.message ||
        'Profile update failed.'
      );
    }
  },

  // RESET PASSWORD
  async resetPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', {
        email: email.trim().toLowerCase(),
      });

      return response.data;

    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
        'Password reset failed.'
      );
    }
  },

  // GET CURRENT USER
  getCurrentUser() {
    const saved = localStorage.getItem(USER_STORAGE_KEY);

    if (!saved) {
      return null;
    }

    try {
      return JSON.parse(saved);
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  },

  // LOGOUT
  logout() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  },

  // CHECK AUTHENTICATION
  isAuthenticated() {
    return Boolean(getStoredToken());
  },
};

export default authService;
