import axios from 'axios';

// Configuração base da API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e renovar token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/token/refresh/`, {
            refresh: refreshToken,
          });

          const { access } = response.data;
          localStorage.setItem('access_token', access);

          // Repetir requisição original
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token inválido, redirecionar para login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/token/', { username, password });
    const { access, refresh } = response.data;
    
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/user/');
    return response.data;
  },
};

// Serviços de tickets
export const ticketService = {
  getTickets: async (params?: any) => {
    const response = await api.get('/tickets/', { params });
    return response.data;
  },

  getTicket: async (id: number) => {
    const response = await api.get(`/tickets/${id}/`);
    return response.data;
  },

  createTicket: async (data: any) => {
    const response = await api.post('/tickets/', data);
    return response.data;
  },

  updateTicket: async (id: number, data: any) => {
    const response = await api.patch(`/tickets/${id}/`, data);
    return response.data;
  },

  deleteTicket: async (id: number) => {
    const response = await api.delete(`/tickets/${id}/`);
    return response.data;
  },

  addComment: async (ticketId: number, data: any) => {
    const response = await api.post(`/tickets/${ticketId}/add_comment/`, data);
    return response.data;
  },

  assignTicket: async (ticketId: number, userId?: number) => {
    const response = await api.post(`/tickets/${ticketId}/assign/`, { user_id: userId });
    return response.data;
  },

  changeStatus: async (ticketId: number, status: string) => {
    const response = await api.post(`/tickets/${ticketId}/change_status/`, { status });
    return response.data;
  },

  getStats: async (days?: number) => {
    const response = await api.get('/tickets/stats/', { params: { days } });
    return response.data;
  },

  getMyTickets: async () => {
    const response = await api.get('/tickets/my_tickets/');
    return response.data;
  },

  getSuggestions: async (ticketId: number) => {
    const response = await api.get(`/tickets/${ticketId}/suggestions/`);
    return response.data;
  },
};

// Serviços de contatos
export const contactService = {
  getContacts: async (params?: any) => {
    const response = await api.get('/contacts/', { params });
    return response.data;
  },

  getContact: async (id: number) => {
    const response = await api.get(`/contacts/${id}/`);
    return response.data;
  },

  createContact: async (data: any) => {
    const response = await api.post('/contacts/', data);
    return response.data;
  },

  updateContact: async (id: number, data: any) => {
    const response = await api.patch(`/contacts/${id}/`, data);
    return response.data;
  },

  deleteContact: async (id: number) => {
    const response = await api.delete(`/contacts/${id}/`);
    return response.data;
  },

  getContactHistory: async (id: number, params?: any) => {
    const response = await api.get(`/contacts/${id}/history/`, { params });
    return response.data;
  },

  getContactTickets: async (id: number, params?: any) => {
    const response = await api.get(`/contacts/${id}/tickets/`, { params });
    return response.data;
  },

  addNote: async (contactId: number, note: string) => {
    const response = await api.post(`/contacts/${contactId}/add_note/`, { note });
    return response.data;
  },

  searchContacts: async (query: string) => {
    const response = await api.get('/contacts/search/', { params: { q: query } });
    return response.data;
  },
};

// Serviços de categorias
export const categoryService = {
  getCategories: async () => {
    const response = await api.get('/categories/');
    return response.data;
  },

  createCategory: async (data: any) => {
    const response = await api.post('/categories/', data);
    return response.data;
  },

  updateCategory: async (id: number, data: any) => {
    const response = await api.patch(`/categories/${id}/`, data);
    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await api.delete(`/categories/${id}/`);
    return response.data;
  },
};

// Serviços de anexos
export const attachmentService = {
  uploadAttachment: async (ticketId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ticket', ticketId.toString());

    const response = await api.post('/attachments/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAttachment: async (id: number) => {
    const response = await api.delete(`/attachments/${id}/`);
    return response.data;
  },
};

export default api;