import { defineStore } from 'pinia';
import TriangulationService from 'src/services/triangulation/TriangulationService';
import { Triangulation } from 'src/entities/triangulation/Triangulation';

export const useTriangulationStore = defineStore('triangulation', {
  state: () => ({
    triangulations: [] as Triangulation[],
    currentTriangulation: null as Triangulation | null,
  }),
  actions: {
    async fetchTriangulations() {
      try {
        this.triangulations = await TriangulationService.getAll();
      } catch (error) {
        console.error('Error fetching triangulations:', error);
      }
    },

    async getTriangulationDetails(id: number) {
      try {
        this.currentTriangulation = await TriangulationService.getById(id);
      } catch (error) {
        console.error('Error fetching triangulation details:', error);
      }
    },

    async saveTriangulation(triangulationData: Partial<Triangulation>) {
      try {
        const newTriangulation = await TriangulationService.save(
          triangulationData
        );
        this.triangulations.push(newTriangulation);
      } catch (error) {
        console.error('Error saving triangulation:', error);
      }
    },

    async deleteTriangulation(id: number) {
      try {
        await TriangulationService.delete(id);
        this.triangulations = this.triangulations.filter(
          (triangulation: any) => triangulation.id !== id
        );
      } catch (error) {
        console.error('Error deleting triangulation:', error);
      }
    },
  },
});
