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
    const response = await api.get('/persons', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/persons/${id}`)
    return response.data
  },

  async save(personData: any) {
    const response = await api.post('/persons', personData)
    return response.data
  },

  async delete(id: number) {
    await api.delete(`/persons/${id}`)
  },
}
