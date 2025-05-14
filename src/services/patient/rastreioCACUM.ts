import api from '../api/apiService';

export default {
    async getRastreioCacumDAta(patientId: string): Promise<any[]> {
        const url = `/encounter?patient=${patientId}&encounterType=e2791f26-1d5f-11e0-b929-000c29ad1d07&v=custom:(uuid,encounterDatetime,auditInfo,form:(display),location:(display))&limit=1&order=desc`;
        const response = await api.get(url);
        return response.data.results || [];
    },

    async getHPVDNAResultData(patientId: string): Promise<any[]> {
        const url = `/obs?patient=${patientId}&concept=527d62e2-b43e-4523-835f-2f0919ef46c5&v=custom:(obsDatetime,value,encounter:(uuid,encounterDatetime,encounterType:(uuid),location.name,form:(uuid,display)))&limit=12`;
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.encounterType) {
                const uuid = item.encounter.encounterType.uuid?.trim(); // Remover espaços em branco
                return ['e2791f26-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },
};
