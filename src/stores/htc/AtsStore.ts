import { defineStore } from 'pinia';
import ATSService from 'src/services/htc/AtsService';
import { ATS } from 'src/entities/htc/Ats';

export const useATSStore = defineStore('ats', {
  state: () => ({
    atsRecords: [] as ATS[], // Lista em cache de registros ATS
    currentATS: null as ATS | null, // Detalhes de um registro ATS específico
  }),

  actions: {
    // Buscar todos os registros ATS
    async fetchATSRecords() {
      try {
        const results = await ATSService.getAll();
        this.atsRecords = results;
      } catch (error) {
        console.error('Erro ao buscar registros ATS:', error);
        throw error;
      }
    },

    // Buscar detalhes de um registro ATS específico
    async fetchATSById(id: number) {
      try {
        const ats = await ATSService.getById(id);
        this.currentATS = ats;
      } catch (error) {
        console.error('Erro ao buscar detalhes do ATS:', error);
        throw error;
      }
    },

    // Salvar um novo registro ATS
    async saveATS(atsData: Partial<ATS>) {
      try {
        const newATS = await ATSService.save(atsData);
        this.atsRecords.push(newATS);
      } catch (error) {
        console.error('Erro ao salvar ATS:', error);
        throw error;
      }
    },

    // Atualizar um registro ATS existente
    async updateATS(id: number, atsData: Partial<ATS>) {
      try {
        const updatedATS = await ATSService.update(id, atsData);
        this.atsRecords = this.atsRecords.map((ats: any) =>
          ats.id === id ? updatedATS : ats
        );
      } catch (error) {
        console.error('Erro ao atualizar ATS:', error);
        throw error;
      }
    },

    // Deletar um registro ATS
    async deleteATS(id: number) {
      try {
        await ATSService.delete(id);
        this.atsRecords = this.atsRecords.filter((ats: any) => ats.id !== id);
      } catch (error) {
        console.error('Erro ao deletar ATS:', error);
        throw error;
      }
    },
  },
});
