// Importando o serviço de API
import api from '../api/apiService';
   
export default {

  async allTBLAM(patientId: string) {    
  
    try {
      // Obter observações de conceito principal
      let concept = 'ef139cb2-97c1-4c0f-9189-5e0711a45b8f'
      const url = `/obs?patient=${patientId}&concept=${concept}&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))`;
      const tbLamResponse = await api.get(url);
    
      const tbLamData = tbLamResponse.data;
    
      // Separar por tipo de formulário
      const rastreioTBLAMLabGeral = tbLamData.results.filter((item: any) => item.encounter.form.uuid === '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8');
      const rastreioTBLAMELab = tbLamData.results.filter((item: any) => item.encounter.form.uuid === '5b7cecc3-4ba3-4710-85ae-fc0c13e83e27');
      const rastreioTBLAMFichaClinica = tbLamData.results.filter((item: any) => item.encounter.form.uuid === '3c2d563a-5d37-4735-a125-d3943a3de30a');
  
      // Obter dados de Nível de Positividade
      concept = '303a4480-f2b3-4192-a446-725a401ebb09'
      const positivityResponse = await api.get(url);;
      const positivityData = positivityResponse.data;
  
      const processData = (mainArray: any, positivityArray: any) => {
        const encounterUuids = mainArray.map((item: any) => item.encounter.uuid);
        const positivityResults = positivityArray.filter((item: any) => encounterUuids.includes(item.encounter.uuid));
  
        return mainArray.map((element: any) => {
          const npValue = positivityResults.find((item: any) => item.encounter.uuid === element.encounter.uuid);
          if (npValue) {
            element.value.comment = npValue.value.display;
          }
          return element;
        });
      };
  
      // Processar os dados
      const processedLabGeral = processData(rastreioTBLAMLabGeral, positivityData.results);
      const processedELab = processData(rastreioTBLAMELab, positivityData.results);
      const processedFichaClinica = processData(rastreioTBLAMFichaClinica, positivityData.results);
    
  
      // retornar todos os dados processados
      return {
        rastreioTBLAMLabGeral: processedLabGeral,
        rastreioTBLAMELab: processedELab,
        rastreioTBLAMFichaClinica: processedFichaClinica,
      };
    } catch (error) {
      console.error('Erro ao buscar dados de TB LAM:', error);
      return [];
    }
  }, 

  async fetchPatientObservations(patientId: string, concept: string, formUuids: any) {
    // Garantir que formUuids seja sempre um array
    const formUuidArray = Array.isArray(formUuids) ? formUuids : [formUuids];

    const url = `/obs?patient=${patientId}&concept=${concept}&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))`;

    try {
      const response = await api.get(url);
      return response.data?.results?.filter((item: any) => {
        if (item.encounter && item.encounter.form) {
          const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
          return formUuidArray.includes(uuid);
        }
        return false;
      }) || [];
    } catch (error) {
      console.error(`Erro ao buscar observações para o conceito ${concept} do paciente ${patientId}:`, error);
      return [];
    }
  },

  async allCD4AbsFSR(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d48fba-1d5f-11e0-b929-000c29ad1d07',
      '5b7cecc3-4ba3-4710-85ae-fc0c13e83e27'
    );
  },

  async allCD4AbsFLG(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d48fba-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allGenexpertFC(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'b08eb89b-c609-4d15-ab81-53ad7c745332',
      '3c2d563a-5d37-4735-a125-d3943a3de30a'
    );
  },

  async allGenexpert(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'b08eb89b-c609-4d15-ab81-53ad7c745332',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allBaciloscopia(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'b08eb89b-c609-4d15-ab81-53ad7c745332',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allBaciloscopiaFC(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'b08eb89b-c609-4d15-ab81-53ad7c745332',
      '3c2d563a-5d37-4735-a125-d3943a3de30a'
    );
  },

  async allCD4CoverageFLG(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d48fba-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allCD4CoverageFSR(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d48fba-1d5f-11e0-b929-000c29ad1d07',
      '5b7cecc3-4ba3-4710-85ae-fc0c13e83e27'
    );
  },

  async allHGB(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1cdbe88-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allAST(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d43a74-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allALT(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d43a74-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allAMI(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d43a74-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allGLC(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d43a74-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  async allPCR(patientId: string) {
    return this.fetchPatientObservations(
      patientId,
      'e1d7f61e-1d5f-11e0-b929-000c29ad1d07',
      '8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'
    );
  },

  //QUALITATIVE CALLS
  async allVLCopiasV2(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'].includes(uuid);
          }
          return false;
      }) || [];
  },

  async allVLCopiasV2FSR(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['5b7cecc3-4ba3-4710-85ae-fc0c13e83e27'].includes(uuid);
          }
          return false;
      }) || [];
  },

  async allVLCopiasV2FC(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['3c2d563a-5d37-4735-a125-d3943a3de30a'].includes(uuid);
          }
          return false;
      }) || [];
  },


  
  //QUANTITATIVE CALLS
  async allVLCopias(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['8377e4ff-d0fe-44a5-81c3-74c9040fd5f8'].includes(uuid);
          }
          return false;
      }) || [];
  },

  async allVLCopiasFSR(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['5b7cecc3-4ba3-4710-85ae-fc0c13e83e27'].includes(uuid);
          }
          return false;
      }) || [];
  },

  async allVLCopiasFC(patientId: string){
      const url = `/obs?patient=${patientId}&concept=e1da2704-1d5f-11e0-b929-000c29ad1d07&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`
      
      const response = await api.get(url);
      return response.data.results.filter((item: any) => {
          if (item.encounter && item.encounter.form) {
              const uuid = item.encounter.form.uuid?.trim(); // Remover espaços em branco
              return ['3c2d563a-5d37-4735-a125-d3943a3de30a'].includes(uuid);
          }
          return false;
      }) || [];
  },



  //---------------------------
  async allVLs(patientId: string) {    
    try {
      const allVLCopiasV2 = await this.allVLCopiasV2(patientId)
      const allVLCopiasV2FSR = await this.allVLCopiasV2FSR(patientId)
      const allVLCopiasV2FC = await this.allVLCopiasV2FC(patientId)

      const allVLsV2 = allVLCopiasV2.concat(allVLCopiasV2FSR.concat(allVLCopiasV2FC))

      // Harmonizar nomes
      allVLsV2.forEach((element: any) =>
        {
          if (typeof element == 'object'){
           if (element?.encounter?.form?.uuid == '0afbb0c7-d58d-4737-8fb1-5f32761b97df'){
            element.value.display = '<'
          } else
          if (element?.encounter?.form?.uuid == 'e24d576a-1d5f-11e0-b929-000c29ad1d07'){
            element.encounter.form.display = 'NIVEL DE DETECCAO BAIXO'
          } else
          if (element?.encounter?.form?.uuid == '65292e1c-87ec-4159-b051-25a9ef84d541'){
            element.encounter.form.display = 'INDETECTAVEL'
          }
        }
      });

      const allVLCopias = await this.allVLCopias(patientId)
      const allVLCopiasFSR = await this.allVLCopiasFSR(patientId)
      const allVLCopiasFC = await this.allVLCopiasFC(patientId)

      const allVLsV3 = allVLCopias.concat(allVLCopiasFSR.concat(allVLCopiasFC))

      allVLsV3.forEach((element: any) => {
        allVLsV2.forEach((elementb: any,i: any) => {
          if (element.obsDatetime == elementb.obsDatetime && element.encounter.form.uuid == elementb.encounter.form.uuid){
            element.value = {
              value:element.value,
              display:element.value +' | '+elementb.value.display
            }
            allVLsV2.splice(i, 1);

          }
        });
      });

      let allVLs = allVLsV3.concat(allVLsV2)

      allVLs = allVLs.sort(function (a: any, b: any) {
        const nameA = a.obsDatetime.toString().toUpperCase(); // ignore upper and lowercase
        const nameB = b.obsDatetime.toString().toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return 1;
        }
        if (nameA > nameB) {
          return -1;
        }
        return 0;
      });
  
      return allVLs
    } catch (error) {
      console.error(`Erro ao buscar observações para o paciente ${patientId}:`, error);
      return [];
    }
  }
}