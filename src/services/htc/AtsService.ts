import api from 'src/services/api/apiService';
import { ATS } from 'src/entities/htc/Ats';

const ATSService = {
  async getAll(): Promise<ATS[]> {
    const response = await api.get('/ats');
    return response.data;
  },

  async getById(id: number): Promise<ATS> {
    const response = await api.get(`/ats/${id}`);
    return response.data;
  },

  async save(data: Partial<ATS>): Promise<ATS> {
    const response = await api.post('/ats', data);
    return response.data;
  },

  async update(id: number, data: Partial<ATS>): Promise<ATS> {
    const response = await api.put(`/ats/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/ats/${id}`);
  },

  async getByPatientId(patientId: number): Promise<ATS[]> {
    const response = await api.get(`/ats/patient/${patientId}`);
    return response.data;
  },
};

export default ATSService;
