import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string // para busca por nome
      [key: string]: any
    } = {},
  ) {
    const response = await api.get('/source-systems', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/source-systems/${id}`)
    return response.data
  },

  async getByCode(code: string) {
    const response = await api.get(`/source-systems/${code}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/source-systems', data)
      return response.data
    } catch (error: any) {
      console.error(
        'Erro na API ao salvar fonte de dados:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/source-systems', data)
      return response.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar fonte de dados:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/source-systems/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/source-systems/${uuid}/status`, {
        lifeCycleStatus,
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado da fonte de dados:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },
}
