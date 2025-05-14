import { defineStore } from 'pinia';
import { HomeVisit } from 'src/entities/homeVisit/HomeVisit';
import api from 'src/services/api/apiService';

export const useHomeVisitStore = defineStore('homeVisit', {
  state: () => ({
    homeVisits: [] as HomeVisit[],
    currentHomeVisit: null as HomeVisit | null,
  }),

  actions: {
    async fetchAll() {
      try {
        // this.homeVisits = await api.getAll();
      } catch (error) {
        console.error('Error fetching home visits:', error);
        throw error;
      }
    },

    async fetchById(id: number) {
      try {
        // this.currentHomeVisit = await api.getById(id);
      } catch (error) {
        console.error('Error fetching home visit by ID:', error);
        throw error;
      }
    },

    async save(homeVisit: Partial<HomeVisit>) {
      try {
        // const savedVisit = await api.save(homeVisit);
        // this.homeVisits.push(savedVisit);
      } catch (error) {
        console.error('Error saving home visit:', error);
        throw error;
      }
    },

    async delete(id: number) {
      try {
        // await api.delete(id);
        this.homeVisits = this.homeVisits.filter((visit) => visit.id !== id);
      } catch (error) {
        console.error('Error deleting home visit:', error);
        throw error;
      }
    },
  },
});
