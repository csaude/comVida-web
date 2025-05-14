import api from '../api/apiService';

export default {
  async getAll() {
    const response = await api.get('/triangulations');
    return response.data;
  },

  async getById(id: any) {
    const response = await api.get(`/triangulations/${id}`);
    return response.data;
  },

  async save(triangulationData: any) {
    const response = await api.post('/triangulations', triangulationData);
    return response.data;
  },

  async delete(id: any) {
    await api.delete(`/triangulations/${id}`);
  },
};
