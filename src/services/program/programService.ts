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
    console.log('Response from getAll:', response)
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/programs/${id}`)
    return response.data
  },

  async save(data: any) {
    const response = await api.post('/programs', data)
    return response.data
  },

  async update(data: any) {
    const response = await api.put('/programs', data)
    return response.data
  },

  async delete(uuid: string) {
    await api.delete(`/programs/${uuid}`)
  },
}
