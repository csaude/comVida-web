import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      [key: string]: any
    } = {}
  ) {
    const response = await api.get('/roles', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/roles/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/roles', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar role:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/roles', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar role:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/roles/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/roles/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar estado da role:', error.response?.data || error.message || error)
      throw error
    }
  }
}
