import api from 'src/services/api/apiService';
import { Patient } from 'src/entities/patient/Patient';

const PatientService = {
  async getAll(): Promise<Patient[]> {
    const response = await api.get('/patients');
    return response.data;
  },

  async getById(id: number): Promise<Patient> {
    const response = await api.get(`/patients/${id}`);
    return response.data;
  },

  async save(patient: Partial<Patient>): Promise<Patient> {
    const response = await api.post('/patients', patient);
    return response.data;
  },

  async update(id: number, patient: Partial<Patient>): Promise<Patient> {
    const response = await api.put(`/patients/${id}`, patient);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patients/${id}`);
  },

  async search(criteria: string): Promise<Patient[]> {
    const response = await api.get(`/patients/search`, {
      params: { q: criteria },
    });
    return response.data;
  },
};

export default PatientService;
