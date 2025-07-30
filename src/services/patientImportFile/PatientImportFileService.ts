import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      status?: string
      [key: string]: any
    } = {},
  ) {
    const response = await api.get('/patient-imports', { params })
    return response.data
  },

  async getPaginated(
    params: {
      page?: number
      size?: number
      status?: string
      sort?: string
      [key: string]: any
    } = {},
  ) {
    const queryParams = { ...params }
    if (Array.isArray(queryParams.status) && queryParams.status.length === 0) {
      delete queryParams.status
    }
    const response = await api.get('/patient-imports', {
      params: queryParams,
    })
    console.log('Response from getPaginated:', response.data)
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/patient-imports/${id}`)
    return response.data
  },

  async uploadFile(formData: any) {
    try {
      const response = await api.post(
        '/patient-imports/upload-excel',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      )
      return response.data
    } catch (error: any) {
      console.error(
        'Erro na API ao salvar arquivo importado:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  // async uploadCohortExcel(payload: {
  //   file: File
  //   serviceId: number
  //   system: string
  // }): Promise<any> {
  //   const formData = new FormData()

  //   formData.append('file', payload.file)
  //   formData.append('serviceId', payload.serviceId.toString())
  //   formData.append('system', payload.system)

  //   const entries = (formData as any).entries()
  //   for (const pair of entries) {
  //     console.log(`${pair[0]}:`, pair[1])
  //   }

  //   const response = await api.post('/patient-imports/upload-excel', formData, {
  //     headers: {
  //       'Content-Type': 'multipart/form-data',
  //     },
  //   })

  //   return response.data
  // },

  async update(data: any) {
    try {
      const response = await api.put('/patient-imports', data)
      return response.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar arquivo importado:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/patient-imports/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/patient-imports/${uuid}/status`, {
        lifeCycleStatus,
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado do arquivo importado:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async uploadCohortExcel(payload: {
    file: string // base64 string
    serviceId: number | string
    system: string
  }) {
    try {
      const response = await api.post('/patient-imports/upload', payload)
      return response.data
    } catch (error: any) {
      console.error(
        'Erro ao importar ficheiro Excel:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async getSheetStatuses(fileId: number) {
    const response = await api.get(`/patient-imports/${fileId}/sheets`)
    return response.data
  },
}
