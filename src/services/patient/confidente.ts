import api from '../api/apiService';

export default {
    async getConfidenteName(patientId: string): Promise<any[]> {
        const url = `/obs?patient=${patientId}&concept=e1de46a4-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.encounterType) {
                const uuid = item.encounter.encounterType.uuid?.trim(); // Remover espaços em branco
                return ['05496c70-845c-40b1-9d28-070f67b3f7da'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async getConfidantContact(patientId: string): Promise<any[]> {
        const url = `/obs?patient=${patientId}&concept=eb23c94a-2c2e-40fa-ab82-22308b1c5f27&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=2`;
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.encounterType) {
                const uuid = item.encounter.encounterType.uuid?.trim(); // Remover espaços em branco
                return ['05496c70-845c-40b1-9d28-070f67b3f7da'].includes(uuid);
            }
            return false;
        }) || [];
    },
};
