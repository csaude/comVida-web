import api from 'src/services/api/apiService';
import { Provider } from 'src/entities/provider/Provider';

const ProviderService = {
  async getAll(): Promise<Provider[]> {
    const response = await api.get('/providers');
    return response.data;
  },

  async getById(id: number): Promise<Provider> {
    const response = await api.get(`/providers/${id}`);
    return response.data;
  },

  async save(provider: Partial<Provider>): Promise<Provider> {
    const response = await api.post('/providers', provider);
    return response.data;
  },

  async update(id: number, provider: Partial<Provider>): Promise<Provider> {
    const response = await api.put(`/providers/${id}`, provider);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/providers/${id}`);
  },
};

export default ProviderService;
