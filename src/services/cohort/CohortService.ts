import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      [key: string]: any
    } = {},
  ) {
    console.log('params', params)
    const response = await api.get('/cohorts', { params })
    return response.data
  },

  async cohortsWithMembers(
    params: {
      page?: number
      size?: number
      sort?: string
      servico?: number | string
      [key: string]: any
    } = {},
  ) {
    const response = await api.get('/cohorts/with-members', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/cohorts/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/cohorts', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao salvar cohort:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/cohorts', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar cohort:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async delete(uuid: string) {
    try {
      await api.delete(`/cohorts/${uuid}`)
    } catch (error: any) {
      console.error(
        'Erro na API ao apagar cohort:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/cohorts/${uuid}/status`, {
        lifeCycleStatus,
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar status do cohort:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },
}
