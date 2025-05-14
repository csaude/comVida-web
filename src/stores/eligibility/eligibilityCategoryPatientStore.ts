import { defineStore } from 'pinia';
import EligibilityCategoryPatientService from 'src/services/eligibility/EligibilityCategoryPatientService';
import { EligibilityCategoryPatient } from 'src/entities/eligibility/EligibilityCategoryPatient';

export const useEligibilityCategoryPatientStore = defineStore(
  'eligibilityCategoryPatient',
  {
    state: () => ({
      patientCategories: [] as EligibilityCategoryPatient[],
    }),
    actions: {
      async fetchPatientCategories() {
        try {
          this.patientCategories =
            await EligibilityCategoryPatientService.getAll();
        } catch (error) {
          console.error('Error fetching eligibility category patients:', error);
        }
      },

      async savePatientCategory(
        patientCategoryData: Partial<EligibilityCategoryPatient>
      ) {
        try {
          const newPatientCategory =
            await EligibilityCategoryPatientService.save(patientCategoryData);
          this.patientCategories.push(newPatientCategory);
        } catch (error) {
          console.error('Error saving eligibility category patient:', error);
        }
      },

      // async deletePatientCategory(patientId: number, categoryId: number) {
      //   try {
      //     await EligibilityCategoryPatientService.delete(categoryId);
      //     this.patientCategories = this.patientCategories.filter(
      //       (pc) => pc.patient_id !== patientId || pc.category_id !== categoryId
      //     );
      //   } catch (error) {
      //     console.error('Error deleting eligibility category patient:', error);
      //   }
      // },
    },
  }
);
