import api from '../api/apiService'

import { EligibilityCriteria } from 'src/entities/eligibility/EligibilityCriteria'

export default {
  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      criteria?: string
    } = {},
  ) {
    const response = await api.get('/eligibility-criteria', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/eligibility-criteria/${id}`)
    return response.data
  },

  async save(data: Partial<EligibilityCriteria>) {
    const payload =
      data instanceof EligibilityCriteria
        ? data.toDTO()
        : new EligibilityCriteria(data).toDTO()
    const response = await api.post('/eligibility-criteria', payload)
    return response.data
  },

  async update(data: EligibilityCriteria) {
    const response = await api.put(
      `/eligibility-criteria/${data.id}`,
      data.toDTO(),
    )
    return response.data
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    const response = await api.patch(`/eligibility-criteria/${uuid}/status`, {
      lifeCycleStatus,
    })
    return response.data
  },

  async delete(uuid: string) {
    await api.delete(`/eligibility-criteria/${uuid}`)
  },
}
