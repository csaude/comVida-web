import { defineStore } from 'pinia';
import CohortService from 'src/services/cohort/CohortService';
import { Cohort } from 'src/entities/cohort/Cohort';

export const useCohortStore = defineStore('cohort', {
  state: () => ({
    cohorts: [] as Cohort[],
    currentCohort: null as Cohort | null,
  }),
  actions: {
    async fetchCohorts() {
      try {
        this.cohorts = await CohortService.getAll();
      } catch (error) {
        console.error('Error fetching cohorts:', error);
      }
    },

    async getCohortDetails(id: number) {
      try {
        this.currentCohort = await CohortService.getById(id);
      } catch (error) {
        console.error('Error fetching cohort details:', error);
      }
    },

    async saveCohort(cohortData: Partial<Cohort>) {
      try {
        const newCohort = await CohortService.save(cohortData);
        this.cohorts.push(newCohort);
      } catch (error) {
        console.error('Error saving cohort:', error);
      }
    },

    async deleteCohort(id: number) {
      try {
        await CohortService.delete(id);
        this.cohorts = this.cohorts.filter((cohort: any) => cohort.id !== id);
      } catch (error) {
        console.error('Error deleting cohort:', error);
      }
    },
  },
});
