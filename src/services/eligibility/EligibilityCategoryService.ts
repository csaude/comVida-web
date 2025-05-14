import api from '../api/apiService';

export default {
  async getAll() {
    const response = await api.get('/eligibility-category-patients');
    return response.data;
  },

  async save(patientCategoryData: any) {
    const response = await api.post(
      '/eligibility-category-patients',
      patientCategoryData
    );
    return response.data;
  },

  async delete(patientId: any, categoryId: any) {
    await api.delete(
      `/eligibility-category-patients?patientId=${patientId}&categoryId=${categoryId}`
    );
  },
};
