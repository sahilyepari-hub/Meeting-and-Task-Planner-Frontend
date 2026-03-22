import api from './api';

const userService = {
  getAllUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  createUser: async (userData) => {
    const response = await api.post('/users', userData);
    return response.data;
  },

  updateUser: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  getUsersByRole: async (role) => {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  },

  getUsersByDepartment: async (departmentId) => {
    const response = await api.get(`/users/department/${departmentId}`);
    return response.data;
  },

  updateUserProfile: async (id, profileData) => {
    const response = await api.patch(`/users/${id}/profile`, profileData);
    return response.data;
  },

  changePassword: async (id, passwordData) => {
    const response = await api.post(`/users/${id}/change-password`, passwordData);
    return response.data;
  }
};

export default userService;