import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      ProgramActivityId?: string
      GroupId?: string
      [key: string]: any
    } = {},
  ) {
    const response = await api.get('/patient-import-configurations', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/patient-import-configurations/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/patient-import-configurations', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao salvar configuração de importação de paciente:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/patient-import-configurations', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar configuração de importação de paciente:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async scheduleDates(data: {
    cohortId: number
    patientImportFileId: number
    entryDate?: string
    exitDate?: string
  }) {
    try {
      const response = await api.post(
        '/patient-import-configurations/schedule',
        data,
      )
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao agendar datas de importação:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async delete(uuid: string) {
    try {
      await api.delete(`/patient-import-configurations/${uuid}`)
    } catch (error: any) {
      console.error(
        'Erro na API ao apagar configuração de importação de paciente:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },
}
