import api from './api';

export const taskService = {
  async getTasks(params = {}) {
    const res = await api.get('/tasks', { params });
    return res.data;
  },

  async getTaskById(id) {
    const res = await api.get(`/tasks/${id}`);
    return res.data;
  },

  async createTask(taskData) {
    const res = await api.post('/tasks', taskData);
    return res.data;
  },

  async updateTask(id, taskData) {
    const res = await api.put(`/tasks/${id}`, taskData);
    return res.data;
  },

  async deleteTask(id) {
    const res = await api.delete(`/tasks/${id}`);
    return res.data;
  }
};
