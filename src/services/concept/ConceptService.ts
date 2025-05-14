import api from 'src/services/api/apiService';
import { Concept } from 'src/entities/concept/Concept';

const ConceptService = {
  async getAll(): Promise<Concept[]> {
    const response = await api.get('/concepts');
    return response.data;
  },

  async getById(id: number): Promise<Concept> {
    const response = await api.get(`/concepts/${id}`);
    return response.data;
  },

  async save(concept: Partial<Concept>): Promise<Concept> {
    const response = await api.post('/concepts', concept);
    return response.data;
  },

  async update(id: number, concept: Partial<Concept>): Promise<Concept> {
    const response = await api.put(`/concepts/${id}`, concept);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/concepts/${id}`);
  },
};

export default ConceptService;
