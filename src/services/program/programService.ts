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
    const response = await api.get('/programs', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/programs/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/programs', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar programa:', error.response?.data || error.message || error)
      throw error // Propaga o erro para a store ou componente tratar
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/programs', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar programa:', error.response?.data || error.message || error)
      throw error // Propaga o erro para a store ou componente tratar
    }
  },

  async delete(uuid: string) {
    await api.delete(`/programs/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/programs/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado do programa:',
        error.response?.data || error.message || error
      )
      throw error
    }
  },

}
