import api from '../api/apiService';

export default {
  async getAll() {
    const response = await api.get('/cohort-members');
    return response.data;
  },

  async getById(id: any) {
    const response = await api.get(`/cohort-members/${id}`);
    return response.data;
  },

  async save(memberData: any) {
    const response = await api.post('/cohort-members', memberData);
    return response.data;
  },

  async delete(id: any) {
    await api.delete(`/cohort-members/${id}`);
  },
};
