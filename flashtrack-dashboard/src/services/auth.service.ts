import api from './api';
import type { LoginCredentials, RegisterData, AuthResponse } from '@/types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<{ message: string }> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  logout() {
    localStorage.removeItem('flashtrack_token');
    localStorage.removeItem('flashtrack_user');
  },

  getToken(): string | null {
    return localStorage.getItem('flashtrack_token');
  },

  setToken(token: string) {
    localStorage.setItem('flashtrack_token', token);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
