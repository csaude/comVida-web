import api from '../api/apiService';

export default {
  /**
   * Fetch the next ART pickup date for a given patient.
   */
  async getNextARTPickupDate(patientId: string): Promise<any[]> {
    const concept = 'e1e2efd8-1d5f-11e0-b929-000c29ad1d07';
    const formUuid = '49857ace-1a92-4980-8313-1067714df151';
    return this.fetchPatientObservations(patientId, concept, formUuid);
  },

  /**
   * Fetch the ART pickup regime for a given patient.
   */
  async getARTPickupRegime(patientId: string): Promise<any[]> {
    const concept = 'e1d83e4e-1d5f-11e0-b929-000c29ad1d07';
    const formUuid = '49857ace-1a92-4980-8313-1067714df151';
    return this.fetchPatientObservations(patientId, concept, formUuid);
  },

  /**
   * Fetch the alternative first row change history.
   */
  async getAlternativeFirstRow(patientId: string): Promise<any[]> {
    const concept = '618650c6-90c3-4acd-ae4d-ffb2f6452a5b';
    const formUuid = '05496c70-845c-40b1-9d28-070f67b3f7da';
    return this.fetchPatientObservations(patientId, concept, formUuid);
  },

  /**
   * Fetch the second row switch history.
   */
  async getSwitchSecondRow(patientId: string): Promise<any[]> {
    const concept = '79c143ea-eeeb-4cdb-bfd7-fed8f029c15b';
    const formUuid = '05496c70-845c-40b1-9d28-070f67b3f7da';
    return this.fetchPatientObservations(patientId, concept, formUuid);
  },

  /**
   * Fetch the third row switch history.
   */
  async getSwitchThirdRow(patientId: string): Promise<any[]> {
    const concept = '4281f035-183f-407d-8286-92613f3039c8';
    const formUuid = '05496c70-845c-40b1-9d28-070f67b3f7da';
    return this.fetchPatientObservations(patientId, concept, formUuid);
  },

  /**
   * Generic method to fetch observations for a given patient and concept.
   */
  async fetchPatientObservations(
    patientId: string,
    concept: string,
    formUuid: string
  ): Promise<any[]> {
    try {
      const url = `/obs?patient=${patientId}&concept=${concept}&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))`;
      const response = await api.get(url);

      // Filter data based on the form UUID
      return response.data?.results?.filter(
        (item: any) => item.encounter.form.uuid === formUuid
      ) || [];
    } catch (error) {
      console.error(`Error fetching observations for concept ${concept}:`, error);
      throw new Error(`Failed to fetch observations for concept ${concept}.`);
    }
  },
};
