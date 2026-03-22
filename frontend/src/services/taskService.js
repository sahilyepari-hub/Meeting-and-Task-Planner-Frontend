import api from './api';

const taskService = {
  getAllTasks: async () => {
    const response = await api.get('/tasks');
    return response.data;
  },

  getTaskById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (taskData) => {
    const response = await api.post('/tasks', taskData);
    return response.data;
  },

  updateTask: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  deleteTask: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  getTasksByAssignee: async (assigneeId) => {
    const response = await api.get(`/tasks/assignee/${assigneeId}`);
    return response.data;
  },

  getTasksByMeeting: async (meetingId) => {
    const response = await api.get(`/tasks/meeting/${meetingId}`);
    return response.data;
  },

  updateTaskStatus: async (id, status, notes) => {
    const response = await api.patch(`/tasks/${id}/status`, { status, notes });
    return response.data;
  },

  generateTaskReport: async (filters) => {
    const response = await api.post('/tasks/report', filters);
    return response.data;
  }
};

export default taskService;