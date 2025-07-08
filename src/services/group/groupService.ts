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
    const response = await api.get('/groups', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/groups/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/groups', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao salvar grupo:',
        error.response?.data || error.message || error
      )
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/groups', data)
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar grupo:',
        error.response?.data || error.message || error
      )
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/groups/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/groups/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado do grupo:',
        error.response?.data || error.message || error
      )
      throw error
    }
  }
}
