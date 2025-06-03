import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      [key: string]: any
    } = {},
  ) {
    const response = await api.get('/patients', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/patients/${id}`)
    return response.data
  },

  async save(data: any) {
    const response = await api.post('/patients', data)
    return response.data
  },

  async delete(id: number) {
    await api.delete(`/patients/${id}`)
  },
}
