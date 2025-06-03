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
    const response = await api.get('/home-visits', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/home-visits/${id}`)
    return response.data
  },

  async save(data: any) {
    const response = await api.post('/home-visits', data)
    return response.data
  },

  async delete(id: number) {
    await api.delete(`/home-visits/${id}`)
  },
}
