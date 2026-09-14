import api from './api';

export const authService = {
  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },

  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // Graceful local cleanup even if request fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data;
  }
};
