import api from '../api/apiService'

export default {
  async fetchAll(params: any = {}) {
    const response = await api.get('/cohort-members/cohorts-with-members', {
      params,
    })
    return response.data
  },
}
