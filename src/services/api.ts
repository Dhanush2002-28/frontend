import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export interface User {
    id: number;
    username: string;
    email: string;
    role: 'employee' | 'admin' | 'resolver';
    created_at?: string;
}

export interface Ticket {
    id: number;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    created_by: number;
    assigned_to?: number;
    deadline?: string;
    created_at: string;
    updated_at: string;
    creator_name?: string;
    creator_email?: string;
    resolver_name?: string;
    resolver_email?: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface CreateTicketRequest {
    title: string;
    description: string;
    priority?: string;
}

export interface UpdateTicketRequest {
    priority?: string;
    status?: string;
    assigned_to?: number;
    deadline?: string;
}

// Auth API
export const authAPI = {
    login: async (data: LoginRequest) => {
        const response = await api.post('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterRequest) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
};

// Tickets API
export const ticketsAPI = {
    getAll: async (): Promise<Ticket[]> => {
        const response = await api.get('/tickets');
        return response.data;
    },

    getById: async (id: number): Promise<Ticket> => {
        const response = await api.get(`/tickets/${id}`);
        return response.data;
    },

    create: async (data: CreateTicketRequest): Promise<Ticket> => {
        const response = await api.post('/tickets', data);
        return response.data;
    },

    update: async (id: number, data: UpdateTicketRequest): Promise<Ticket> => {
        const response = await api.put(`/tickets/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        const response = await api.delete(`/tickets/${id}`);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/tickets/stats/overview');
        return response.data;
    },
};

// Users API
export const usersAPI = {
    getAll: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    getResolvers: async (): Promise<User[]> => {
        const response = await api.get('/users/resolvers');
        return response.data;
    },

    getProfile: async (): Promise<User> => {
        const response = await api.get('/users/profile');
        return response.data;
    },
};

export default api;
