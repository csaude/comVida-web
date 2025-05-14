import api from 'src/services/api/apiService';
import { HomeVisit } from 'src/entities/homeVisit/HomeVisit';

export default {
  async getAll(): Promise<HomeVisit[]> {
    const response = await api.get('/home-visits');
    return response.data;
  },

  async getById(id: number): Promise<HomeVisit> {
    const response = await api.get(`/home-visits/${id}`);
    return response.data;
  },

  async save(homeVisit: Partial<HomeVisit>): Promise<HomeVisit> {
    const response = await api.post('/home-visits', homeVisit);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/home-visits/${id}`);
  },
};
