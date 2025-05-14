// Importando o serviço de API
import api from '../api/apiService';

export default {
    async fetchPatientObservations(patientId: string, concept: string, formUuids: string | string[]): Promise<any[]> {
        // Garantir que formUuids seja sempre um array
        const formUuidArray: string[] = Array.isArray(formUuids) ? formUuids : [formUuids];

        const url: string = `/obs?patient=${patientId}&concept=${concept}&v=custom:(obsDatetime,value,comment,encounter:(uuid,location.name,form:(uuid,display)))`;

        try {
            const response = await api.get(url);
            return response.data?.results?.filter((item: any) => {
                if (item.encounter && item.encounter.form) {
                    const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                    return formUuidArray.includes(uuid);
                }
                return false;
            }) || [];
        } catch (error) {
            console.error(`Erro ao buscar observações para o conceito ${concept} do paciente ${patientId}:`, error);
            return [];
        }
    },

    async IPTStartFichaClinica(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=b6c4d473-2af5-4c4d-a9bb-ad3779fa5579&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['3c2d563a-5d37-4735-a125-d3943a3de30a', 'e1d9ef28-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTStartFichaResumo(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=b6c4d473-2af5-4c4d-a9bb-ad3779fa5579&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['05496c70-845c-40b1-9d28-070f67b3f7da', 'e1d9ef28-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTStartFichaSeguimento(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=b6c4d473-2af5-4c4d-a9bb-ad3779fa5579&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['78d47629-5ac4-4e16-8972-2166eef30bfd', 'e1d9ef28-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTStartFichaClinicaProfilaxia(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=9db4ce3b-4c1c-45dd-905f-c984a052f26e&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['3c2d563a-5d37-4735-a125-d3943a3de30a'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTStartFichaResumoProfilaxia(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=9db4ce3b-4c1c-45dd-905f-c984a052f26e&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['05496c70-845c-40b1-9d28-070f67b3f7da'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTStartFichaSeguimentoProfilaxia(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=9db4ce3b-4c1c-45dd-905f-c984a052f26e&v=custom:(obsDatetime,value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim(); // Remover espaços em branco
                return ['78d47629-5ac4-4e16-8972-2166eef30bfd'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async allIPTStart(patientId: string): Promise<any[]> {
        const iPTStartFichaClinicaJSON: any[] = await this.IPTStartFichaClinica(patientId);
        const iPTStartFichaResumoJSON: any[] = await this.IPTStartFichaResumo(patientId);
        const iPTStartFichaSeguimentoJSON: any[] = await this.IPTStartFichaSeguimento(patientId);
        let allIPTStart: any[] = iPTStartFichaClinicaJSON.concat(iPTStartFichaResumoJSON.concat(iPTStartFichaSeguimentoJSON));

        allIPTStart = allIPTStart.filter((item: any) => {
            if (item.value.display) {
                const status: string = item.value.display?.trim();
                return status === 'INICIAR';
            }
            return false;
        });

        const iPTStartFichaClinicaProfilaxia: any[] = await this.IPTStartFichaClinicaProfilaxia(patientId);
        const iPTStartFichaResumoProfilaxia: any[] = await this.IPTStartFichaResumoProfilaxia(patientId);
        const iPTStartFichaSeguimentoProfilaxia: any[] = await this.IPTStartFichaSeguimentoProfilaxia(patientId);
        const allIPTStartProfilaxia: any[] = iPTStartFichaClinicaProfilaxia.concat(iPTStartFichaResumoProfilaxia.concat(iPTStartFichaSeguimentoProfilaxia));

        allIPTStart.forEach((element: any) => {
            allIPTStartProfilaxia.forEach((elementb: any) => {
                if (element.encounter.form.uuid === elementb.encounter.form.uuid && element.encounter.uuid === elementb.encounter.uuid) {
                    element.profilaxia = elementb.value.display;
                    console.log('element: ', JSON.stringify(element, null, 2));
                }
            });
        });

        allIPTStart.sort((a: any, b: any) => {
            const dateA: Date = new Date(a.obsDatetime);
            const dateB: Date = new Date(b.obsDatetime);
            return dateB.getTime() - dateA.getTime();
        });

        return allIPTStart;
    },

    async IPTEndFichaClinica(patientId: string): Promise<any[]> {
        return this.fetchPatientObservations(
            patientId,
            'b6c4d473-2af5-4c4d-a9bb-ad3779fa5579',
            ['3c2d563a-5d37-4735-a125-d3943a3de30a', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07']
        );
    },

    async IPTEndFichaResumo(patientId: string): Promise<any[]> {
        return this.fetchPatientObservations(
            patientId,
            'b6c4d473-2af5-4c4d-a9bb-ad3779fa5579',
            ['05496c70-845c-40b1-9d28-070f67b3f7da', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07']
        );
    },

    async IPTEndFichaSeguimento(patientId: string): Promise<any[]> {
        return this.fetchPatientObservations(
            patientId,
            'b6c4d473-2af5-4c4d-a9bb-ad3779fa5579',
            ['78d47629-5ac4-4e16-8972-2166eef30bfd', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07']
        );
    },

    async allIPTEnd(patientId: string): Promise<any[]> {
        let allIPTEnd: any[] = [
            ...await this.IPTEndFichaClinica(patientId),
            ...await this.IPTEndFichaResumo(patientId),
            ...await this.IPTEndFichaSeguimento(patientId),
        ];

        allIPTEnd = allIPTEnd.filter((item: any) => {
            if (item.value.display) {
                const status: string = item.value.display?.trim();
                return status === 'COMPLETO';
            }
            return false;
        });

        const allIPTStartProfilaxia: any[] = [
            ...await this.IPTStartFichaClinicaProfilaxia(patientId),
            ...await this.IPTStartFichaResumoProfilaxia(patientId),
            ...await this.IPTStartFichaSeguimentoProfilaxia(patientId),
        ];

        allIPTEnd.forEach((element: any) => {
            allIPTStartProfilaxia.forEach((elementb: any) => {
                if (element.encounter.form.uuid === elementb.encounter.form.uuid && element.encounter.uuid === elementb.encounter.uuid) {
                    element.profilaxia = elementb.value.display;
                }
            });
        });

        allIPTEnd.sort((a: any, b: any) => {
            const dateA: Date = new Date(a.obsDatetime);
            const dateB: Date = new Date(b.obsDatetime);
            return dateB.getTime() - dateA.getTime();
        });

        return allIPTEnd;
    },

    async CTZStartFichaClinica(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=2616b3c9-9a99-4b9a-b673-10871f4a4c71&v=custom:(obsDatetime,concept:(uuid),value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim();
                return ['3c2d563a-5d37-4735-a125-d3943a3de30a', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async CTZEndFichaClinica(patientId: string): Promise<any[]> {
        const url: string = `/obs?patient=${patientId}&concept=2616b3c9-9a99-4b9a-b673-10871f4a4c71&v=custom:(obsDatetime,concept:(uuid),value,encounter:(uuid,location.name,form:(uuid,display)))&limit=12`;
        
        const response = await api.get(url);
        return response.data?.results?.filter((item: any) => {
            if (item.encounter && item.encounter.form) {
                const uuid: string = item.encounter.form.uuid?.trim();
                return ['3c2d563a-5d37-4735-a125-d3943a3de30a', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07'].includes(uuid);
            }
            return false;
        }) || [];
    },

    async IPTEndFichaFILT(patientId: string): Promise<any[]> {
        return this.fetchPatientObservations(
            patientId,
            '2616b3c9-9a99-4b9a-b673-10871f4a4c71',
            ['3c2d563a-5d37-4735-a125-d3943a3de30a', 'e1d9facc-1d5f-11e0-b929-000c29ad1d07']
        );
    },
}
