import api from '../api/apiService'
import { Cohort } from 'src/entities/cohort/Cohort'

export default {
  async getAll(params?: {
    page?: number
    size?: number
    sort?: string
    [key: string]: any // para permitir filtros adicionais
  }): Promise<{
    content: Cohort[]
    totalSize: number
    totalPages: number
    number: number
  }> {
    const response = await api.get('/cohorts', { params })
    return response.data
  },

  async getById(id: number): Promise<Cohort> {
    const response = await api.get(`/cohorts/${id}`)
    return response.data
  },

  async save(cohortData: Partial<Cohort>): Promise<Cohort> {
    const response = await api.post('/cohorts', cohortData)
    return response.data
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/cohorts/${id}`)
  },
}
