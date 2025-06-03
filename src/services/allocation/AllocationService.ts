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
    const response = await api.get('/allocations', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/allocations/${id}`)
    return response.data
  },

  async save(allocationData: any) {
    const response = await api.post('/allocations', allocationData)
    return response.data
  },

  async delete(id: number) {
    await api.delete(`/allocations/${id}`)
  },
}
