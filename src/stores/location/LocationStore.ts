import { defineStore } from 'pinia';
import LocationService from '../../services/location/LocationService';
import { Location } from '../../entities/location/Location';

export const useLocationStore = defineStore('location', {
  state: () => ({
    locations: [] as Location[], // Lista em cache de locais
    currentLocation: null as Location | null, // Detalhes de um local específico
  }),

  actions: {
    // Buscar todos os locais
    async fetchLocations() {
      try {
        const results = await LocationService.getAll();
        this.locations = results;
      } catch (error) {
        console.error('Erro ao buscar locais:', error);
        throw error;
      }
    },

    // Buscar detalhes de um local específico
    async fetchLocationById(id: number) {
      try {
        const location = await LocationService.getById(id);
        this.currentLocation = location;
      } catch (error) {
        console.error('Erro ao buscar detalhes do local:', error);
        throw error;
      }
    },

    // Salvar um novo local
    async saveLocation(locationData: Partial<Location>) {
      try {
        const newLocation = await LocationService.save(locationData);
        this.locations.push(newLocation);
      } catch (error) {
        console.error('Erro ao salvar local:', error);
        throw error;
      }
    },

    // Atualizar um local existente
    async updateLocation(id: number, locationData: Partial<Location>) {
      try {
        const updatedLocation = await LocationService.update(id, locationData);
        this.locations = this.locations.map((location) =>
          location.id === id ? updatedLocation : location
        );
      } catch (error) {
        console.error('Erro ao atualizar local:', error);
        throw error;
      }
    },

    // Deletar um local
    async deleteLocation(id: number) {
      try {
        await LocationService.delete(id);
        this.locations = this.locations.filter(
          (location) => location.id !== id
        );
      } catch (error) {
        console.error('Erro ao deletar local:', error);
        throw error;
      }
    },
  },
});
