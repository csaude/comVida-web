import { defineStore } from 'pinia';
import PatientService from '../../services/patient/patientService';
import { Patient } from '../../entities/patient/Patient';

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patients: [] as Patient[], // Cached list of patients
    currentPatient: null as Patient | null, // Detailed view of a single patient
  }),
  actions: {
    // Search patients and cache results
    async searchPatients(search: string, index = 0) {
      try {
        // const results = await PatientService.searchPatients(search, index);
        // this.patients = results;
      } catch (error) {
        console.error('Error searching patients:', error);
        throw error;
      }
    },

    async search(search: string) {
      try {
        const results = await PatientService.search(search);
        this.patients = results;
      } catch (error) {
        console.error('Error searching patients on DB:', error);
        throw error;
      }
    },

    // Get patient details and cache the result
    async getPatientDetails(patientId: string) {
      try {
        // const patient = await PatientService.getPatientDetails(patientId);
        // this.currentPatient = patient;
      } catch (error) {
        console.error('Error fetching patient details:', error);
        throw error;
      }
    },

    // Save a new patient and update the cache
    async savePatient(patientData: Partial<Patient>) {
      try {
        // const newPatient = await PatientService.savePatient(patientData);
        // this.patients.push(newPatient);
      } catch (error) {
        console.error('Error saving patient:', error);
        throw error;
      }
    },

    // Delete a patient and update the cache
    async deletePatient(id: number) {
      try {
        // await PatientService.deletePatient(id);
        this.patients = this.patients.filter((patient) => patient.id !== id);
      } catch (error) {
        console.error('Error deleting patient:', error);
        throw error;
      }
    },
  },
});
