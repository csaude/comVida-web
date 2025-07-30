import { defineStore } from 'pinia'
import CohortWithMembersService from 'src/services/cohort/CohortWithMembersService'
import { CohortWithMembers } from 'src/entities/cohort/CohortWithMembers'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useCohortWithMembersStore = defineStore('cohortWithMembers', {
  state: () => ({
    cohortsPages: {} as Record<number, CohortWithMembers[]>,
    currentPageCohorts: [] as CohortWithMembers[],
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10,
    },
  }),

  actions: {
    async fetchCohortsWithMembers(
      params: {
        page?: number
        size?: number
        name?: string
        [key: string]: any
      } = {},
    ) {
      const name = params.name?.trim() || null
      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize

      this.loading = true
      this.error = null

      try {
        const response = await CohortWithMembersService.fetchAll({
          ...params,
          page,
          size,
          name: name !== null ? name : undefined,
        })

        const cohorts = (response.content ?? []).map((dto: any) =>
          CohortWithMembers.fromDTO(dto),
        )

        this.cohortsPages[page] = cohorts
        this.currentPageCohorts = cohorts
        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar cohorts com membros'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllCohortsWithMembersAcrossPages(): CohortWithMembers[] {
      return flattenPages(this.cohortsPages)
    },
  },
})
