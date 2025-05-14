import api from 'src/services/api/apiService';
import { Settings } from 'src/entities/settings/Settings';

const SettingsService = {
  async getAll(): Promise<Settings[]> {
    const response = await api.get('/settings');
    return response.data;
  },

  async getById(id: number): Promise<Settings> {
    const response = await api.get(`/settings/${id}`);
    return response.data;
  },

  async save(settings: Partial<Settings>): Promise<Settings> {
    const response = await api.post('/settings', settings);
    return response.data;
  },

  async update(id: number, settings: Partial<Settings>): Promise<Settings> {
    const response = await api.put(`/settings/${id}`, settings);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/settings/${id}`);
  },
};

export default SettingsService;
