import api from 'src/services/api/apiService';
import { EligibilityCategoryPatient } from 'src/entities/eligibility/EligibilityCategoryPatient';

const EligibilityCategoryPatientService = {
  async getAll(): Promise<EligibilityCategoryPatient[]> {
    const response = await api.get('/eligibility-category-patients');
    return response.data;
  },

  async getById(id: number): Promise<EligibilityCategoryPatient> {
    const response = await api.get(`/eligibility-category-patients/${id}`);
    return response.data;
  },

  async save(
    data: Partial<EligibilityCategoryPatient>
  ): Promise<EligibilityCategoryPatient> {
    const response = await api.post('/eligibility-category-patients', data);
    return response.data;
  },

  async update(
    id: number,
    data: Partial<EligibilityCategoryPatient>
  ): Promise<EligibilityCategoryPatient> {
    const response = await api.put(
      `/eligibility-category-patients/${id}`,
      data
    );
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/eligibility-category-patients/${id}`);
  },
};

export default EligibilityCategoryPatientService;
