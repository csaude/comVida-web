import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string // para busca por nome
      [key: string]: any
    } = {}
  ) {
    const response = await api.get('/program-activities', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/program-activities/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/program-activities', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao salvar atividade do programa:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/program-activities', data)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar atividade do programa:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/program-activities/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/program-activities/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar estado da atividade do programa:', error.response?.data || error.message || error)
      throw error
    }
  }
}
