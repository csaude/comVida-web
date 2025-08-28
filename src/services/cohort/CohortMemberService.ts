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

  async getAllByCohortId(
    params: {
      page?: number
      size?: number
      sort?: string
      cohortId?: string | number
      [key: string]: any
    } = {},
  ) {
    const response = await api.get(`/cohort-members/by-cohort`, {
      params,
    })
    return response.data
  },

  async findByCohortIdAndPatientImportFileId(
    params: {
      page?: number
      size?: number
      sort?: string
      cohortId?: string | number
      fileId?: string | number
      [key: string]: any
    } = {},
  ) {
    const response = await api.get(`/cohort-members/by-cohort-and-file`, {
      params,
    })
    console.log(
      'Response from findByCohortIdAndPatientImportFileId:',
      response.data,
    )
    return response.data
  },

  async allocateMember(memberId: number, assignedByUserId: number) {
    try {
      const response = await api.post('/cohort-members/allocation', {
        memberId,
        assignedByUserId,
      })
      return response.data // { message, data: CohortMemberDTO }
    } catch (error: any) {
      console.error(
        'Erro na alocação do membro:',
        error.response?.data || error.message || error,
      )
      throw error
    }
  },

  async allocateMembers(memberIds: number[], assignedByUserId: number) {
    try {
      const response = await api.post('/cohort-members/allocation/bulk', {
        memberIds,
        assignedByUserId,
      })
      return response.data
    } catch (error: any) {
      console.error(
        'Erro na alocação em massa:',
        error.response?.data || error.message,
      )
      throw error
    }
  },
}
