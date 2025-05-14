import api from '../api/apiService';

export default {
async getARTStartDate(patientId: string): Promise<any[]> {
    const url = `/obs?patient=${patientId}&concept=e1d8f690-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
    const response = await api.get(url);
    return response.data.results || [];
},
      

  async getHealthFacilityAtARTStart(patientId: string): Promise<any[]> {
    const url = `/obs?patient=${patientId}&concept=760180a9-bcf0-4820-8771-d57d73d1f68d&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=1`;
    const response = await api.get(url);
    return response.data.results || [];
  },
  

  async getPregnancyStatusAtARTStart(patientId: string): Promise<any[]> {
    const url = `/encounter?patient=${patientId}&encounterType=e422ecf9-75dd-4367-b21e-54bccabc4763&v=full&limit=1&order=desc`;
    const response = await api.get(url);
    console.log('getPregnancyStatusAtARTStart====>',response)
    const data = response.data.results[0]?.obs.filter((item: any) => item.concept.uuid === 'e1e056a6-1d5f-11e0-b929-000c29ad1d07');
    console.log(data)
    if (data?.length > 0) {
      data[0].source = response.data?.results[0]?.form?.display;
    }
    return data || [];
  },

  async getWHOStagingAtARTStart(patientId: string): Promise<any[]> {
    const url = `/encounter?patient=${patientId}&encounterType=e422ecf9-75dd-4367-b21e-54bccabc4763&v=full&limit=1&order=desc`;
    const response = await api.get(url);
    const data = response.data.results[0]?.obs.filter((item: any) => item.concept.uuid === 'e1e53c02-1d5f-11e0-b929-000c29ad1d07');
    console.log(data)
    if (data?.length > 0) {
        data[0].source = response.data.results[0]?.form?.display;
    }
    console.log(data)
    return data || [];
  },
};
