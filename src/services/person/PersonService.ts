import api from 'src/services/api/apiService';
import { Person } from 'src/entities/Person/Person';

const PersonService = {
  async getAll(): Promise<Person[]> {
    const response = await api.get('/persons');
    return response.data;
  },

  async getById(id: number): Promise<Person> {
    const response = await api.get(`/persons/${id}`);
    return response.data;
  },

  async save(person: Partial<Person>): Promise<Person> {
    const response = await api.post('/persons', person);
    return response.data;
  },

  async update(id: number, person: Partial<Person>): Promise<Person> {
    const response = await api.put(`/persons/${id}`, person);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/persons/${id}`);
  },
};

export default PersonService;
