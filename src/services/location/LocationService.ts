import api from 'src/services/api/apiService';
import { Location } from 'src/entities/location/Location';

const LocationService = {
  async getAll(): Promise<Location[]> {
    const response = await api.get('/locations');
    return response.data;
  },

  async getById(id: number): Promise<Location> {
    const response = await api.get(`/locations/${id}`);
    return response.data;
  },

  async save(location: Partial<Location>): Promise<Location> {
    const response = await api.post('/locations', location);
    return response.data;
  },

  async update(id: number, location: Partial<Location>): Promise<Location> {
    const response = await api.put(`/locations/${id}`, location);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/locations/${id}`);
  },
};

export default LocationService;
