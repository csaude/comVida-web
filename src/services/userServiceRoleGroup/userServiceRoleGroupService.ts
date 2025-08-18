import api from '../api/apiService'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      userServiceRoleUuid?: string
      [key: string]: any
    } = {}
  ) {
    const response = await api.get('/user-service-role-groups', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/user-service-role-groups/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/user-service-role-groups', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar vínculo (UserServiceRoleGroup):', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/user-service-role-groups', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar vínculo (UserServiceRoleGroup):', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/user-service-role-groups/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/user-service-role-groups/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar estado (UserServiceRoleGroup):', error.response?.data || error.message || error)
      throw error
    }
  }
}
