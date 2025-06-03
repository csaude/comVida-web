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
    const response = await api.get('/cohort-members', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/cohort-members/${id}`)
    return response.data
  },

  async save(data: any) {
    const response = await api.post('/cohort-members', data)
    return response.data
  },

  async delete(id: number) {
    await api.delete(`/cohort-members/${id}`)
  },
}
