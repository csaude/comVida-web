import { defineStore } from 'pinia';
import ConceptService from '../../services/concept/ConceptService';
import { Concept } from '../../entities/concept/Concept';

export const useConceptStore = defineStore('concept', {
  state: () => ({
    concepts: [] as Concept[], // Lista em cache de conceitos
    currentConcept: null as Concept | null, // Detalhes de um conceito específico
  }),

  actions: {
    // Buscar todos os conceitos
    async fetchConcepts() {
      try {
        const results = await ConceptService.getAll();
        this.concepts = results;
      } catch (error) {
        console.error('Erro ao buscar conceitos:', error);
        throw error;
      }
    },

    // Buscar detalhes de um conceito específico
    async fetchConceptById(id: number) {
      try {
        const concept = await ConceptService.getById(id);
        this.currentConcept = concept;
      } catch (error) {
        console.error('Erro ao buscar detalhes do conceito:', error);
        throw error;
      }
    },

    // Salvar um novo conceito
    async saveConcept(conceptData: Partial<Concept>) {
      try {
        const newConcept = await ConceptService.save(conceptData);
        this.concepts.push(newConcept);
      } catch (error) {
        console.error('Erro ao salvar conceito:', error);
        throw error;
      }
    },

    // Atualizar um conceito existente
    async updateConcept(id: number, conceptData: Partial<Concept>) {
      try {
        const updatedConcept = await ConceptService.update(id, conceptData);
        this.concepts = this.concepts.map((concept) =>
          concept.id === id ? updatedConcept : concept
        );
      } catch (error) {
        console.error('Erro ao atualizar conceito:', error);
        throw error;
      }
    },

    // Deletar um conceito
    async deleteConcept(id: number) {
      try {
        await ConceptService.delete(id);
        this.concepts = this.concepts.filter((concept) => concept.id !== id);
      } catch (error) {
        console.error('Erro ao deletar conceito:', error);
        throw error;
      }
    },
  },
});
