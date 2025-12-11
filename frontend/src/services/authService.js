import api from './api';

const authService = {
  login: async (email, contraseña) => {
    const response = await api.post('/auth/login', { email, contraseña });
    return response.data;
  },

  registerJugador: async (userData) => {
    return await api.post('/auth/register-jugador', userData);
  },

  registerOrganizador: async (userData) => {
    return await api.post('/auth/register-organizador', userData);
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('usuario');
  },

  getToken: () => {
    return localStorage.getItem('access_token');
  },

  getUser: () => {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
  },

  setUser: (userData) => {
    localStorage.setItem('usuario', JSON.stringify(userData));
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
