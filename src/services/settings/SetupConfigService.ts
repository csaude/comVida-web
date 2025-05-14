import api from 'src/services/api/apiService';
import { SetupConfig } from 'src/entities/settings/SetupConfig';

const SetupConfigService = {
  async getAll(): Promise<SetupConfig[]> {
    const response = await api.get('/setup-configs');
    return response.data;
  },

  async getById(id: number): Promise<SetupConfig> {
    const response = await api.get(`/setup-configs/${id}`);
    return response.data;
  },

  async save(setupConfig: Partial<SetupConfig>): Promise<SetupConfig> {
    const response = await api.post('/setup-configs', setupConfig);
    return response.data;
  },

  async update(
    id: number,
    setupConfig: Partial<SetupConfig>
  ): Promise<SetupConfig> {
    const response = await api.put(`/setup-configs/${id}`, setupConfig);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/setup-configs/${id}`);
  },
};

export default SetupConfigService;
