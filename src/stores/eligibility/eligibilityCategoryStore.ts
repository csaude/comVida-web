import { defineStore } from 'pinia';
import EligibilityCategoryService from 'src/services/eligibility/EligibilityCategoryService';
import { EligibilityCategory } from 'src/entities/eligibility/EligibilityCategory';

export const useEligibilityCategoryStore = defineStore('eligibilityCategory', {
  state: () => ({
    categories: [] as EligibilityCategory[],
    currentCategory: null as EligibilityCategory | null,
  }),
  actions: {
    async fetchCategories() {
      try {
        this.categories = await EligibilityCategoryService.getAll();
      } catch (error) {
        console.error('Error fetching eligibility categories:', error);
      }
    },

    async getCategoryDetails(id: number) {
      try {
        // this.currentCategory = await EligibilityCategoryService.getById(id);
      } catch (error) {
        console.error('Error fetching category details:', error);
      }
    },

    async saveCategory(categoryData: Partial<EligibilityCategory>) {
      try {
        const newCategory = await EligibilityCategoryService.save(categoryData);
        this.categories.push(newCategory);
      } catch (error) {
        console.error('Error saving eligibility category:', error);
      }
    },

    async deleteCategory(id: number) {
      try {
        // await EligibilityCategoryService.delete(id);
        this.categories = this.categories.filter(
          (category) => category.id !== id
        );
      } catch (error) {
        console.error('Error deleting eligibility category:', error);
      }
    },
  },
});
