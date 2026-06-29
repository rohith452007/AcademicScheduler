import api from './api';

const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    signup: async (userData) => {
        const response = await api.post('/auth/signup', userData);
        return response.data;
    },
    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
    verifyCode: async (email, token) => {
        const response = await api.post('/auth/verify-code', { email, token });
        return response.data;
    },
    resetPassword: async (email, token, password) => {
        const response = await api.post('/auth/reset-password', { email, token, password });
        return response.data;
    },
    registerInstitute: async (data) => {
        const response = await api.post('/auth/register-institute', data);
        return response.data;
    }
};

export default authService;
