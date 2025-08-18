import api from '../api/apiService'

export default {
  // ===== CRUD/listagem =====
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      userUuid?: string
      roleUuid?: string
      programActivityUuid?: string
      [key: string]: any
    } = {}
  ) {
    const response = await api.get('/user-service-roles', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/user-service-roles/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/user-service-roles', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar vínculo (UserServiceRole):', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/user-service-roles', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar vínculo (UserServiceRole):', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/user-service-roles/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/user-service-roles/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar estado do vínculo:', error.response?.data || error.message || error)
      throw error
    }
  },

  // ===== Endpoints especiais (assign/replace/remove) =====

  /** Atribui uma ou mais roles ao utilizador (idempotente). */
  async assignRoles(userUuid: string, payload: { roleUuids: string[]; programActivityUuid?: string | null }) {
    try {
      const response = await api.post(`/user-service-roles/${userUuid}/roles/assign`, payload)
      return response.data.data // lista de UserServiceRoleDTO
    } catch (error: any) {
      console.error('Erro na API ao atribuir roles:', error.response?.data || error.message || error)
      throw error
    }
  },

  /** Substitui o conjunto de roles do utilizador para um escopo. */
  async replaceRoles(userUuid: string, payload: { roleUuids: string[]; programActivityUuid?: string | null }) {
    try {
      const response = await api.put(`/user-service-roles/${userUuid}/roles/replace`, payload)
      return response.data.data // lista final de UserServiceRoleDTO
    } catch (error: any) {
      console.error('Erro na API ao substituir roles:', error.response?.data || error.message || error)
      throw error
    }
  },

  /** Remove uma role do utilizador (com escopo opcional via query param). */
  async removeRole(userUuid: string, roleUuid: string, programActivityUuid?: string) {
    const config = programActivityUuid ? { params: { programActivityUuid } } : undefined
    await api.delete(`/user-service-roles/${userUuid}/roles/${roleUuid}`, config)
  }
}
