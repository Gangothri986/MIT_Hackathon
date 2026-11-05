import { apiClient, isDemoMode } from './api';

const DEFAULT_FARMER_USER = {
  id: 'usr_farmer_01',
  name: 'Ramesh Kumar',
  email: 'ramesh.farmer@agrovision.in',
  role: 'Farmer & Farm Owner',
  farmName: 'Green Valley Farm',
  location: 'Southern Agricultural Region',
  farmSize: '5 Acres',
  cropsMonitored: ['Tomato', 'Chilli', 'Paddy'],
};

export const authService = {
  async login(email, password, remember = true) {
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!email || !password) {
        throw new Error('Please enter both email and password.');
      }
      const token = 'jwt_token_agrovision_farmer';
      if (remember) {
        localStorage.setItem('agrovision_auth_token', token);
      } else {
        sessionStorage.setItem('agrovision_auth_token', token);
      }
      localStorage.setItem('agrovision_user_profile', JSON.stringify(DEFAULT_FARMER_USER));
      return { user: DEFAULT_FARMER_USER, token };
    }

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data?.token) {
        localStorage.setItem('agrovision_auth_token', response.data.token);
      }
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  },

  async signup(userData) {
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const newUser = {
        ...DEFAULT_FARMER_USER,
        name: userData.name || 'Farmer',
        email: userData.email,
        farmName: userData.farmName || 'My Farm',
        location: userData.location || 'Local Farm',
      };
      const token = 'jwt_token_agrovision_farmer_registered';
      localStorage.setItem('agrovision_auth_token', token);
      localStorage.setItem('agrovision_user_profile', JSON.stringify(newUser));
      return { user: newUser, token };
    }

    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Registration failed.');
    }
  },

  async resetPassword(email) {
    if (isDemoMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return { success: true, message: `Reset link dispatched to ${email}` };
    }
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  getCurrentUser() {
    const saved = localStorage.getItem('agrovision_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_FARMER_USER;
      }
    }
    return DEFAULT_FARMER_USER;
  },

  updateUserProfile(updatedData) {
    const current = this.getCurrentUser();
    const merged = { ...current, ...updatedData };
    localStorage.setItem('agrovision_user_profile', JSON.stringify(merged));
    return merged;
  },

  logout() {
    localStorage.removeItem('agrovision_auth_token');
    sessionStorage.removeItem('agrovision_auth_token');
  },

  isAuthenticated() {
    return Boolean(
      localStorage.getItem('agrovision_auth_token') ||
      sessionStorage.getItem('agrovision_auth_token')
    );
  },
};
