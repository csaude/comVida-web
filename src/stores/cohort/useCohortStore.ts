import { defineStore } from 'pinia'
import CohortService from 'src/services/cohort/CohortService'
import { Cohort } from 'src/entities/cohort/Cohort'
import { replaceOrInsert } from 'src/utils/storeUtils'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useCohortStore = defineStore('cohort', {
  state: () => ({
    cohortsPages: {} as Record<number, Cohort[]>,
    currentPageCohorts: [] as Cohort[],
    currentCohort: null as Cohort | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 10
    }
  }),

  actions: {
    async fetchCohorts(params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const name = params.name?.trim() || null
      const ignoreCache = params.ignoreCache ?? false
      const isSearch = typeof name === 'string' && name.trim() !== ''
      const usePagination = params.page !== undefined || params.size !== undefined
      const useCache = !ignoreCache && !isSearch && usePagination

      const defaultSize = this.pagination.pageSize
      const page = params.page ?? 0
      const size = params.size ?? defaultSize

      if (useCache && this.cohortsPages[page]) {
        this.currentPageCohorts = this.cohortsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await CohortService.getAll({ ...params, page, size, name: name !== null ? name : 'null' })
        const cohorts = (response.content ?? []).map((dto: any) =>
          Cohort.fromDTO(dto)
        )

        if (!usePagination) {
          const paged = paginateArray(cohorts, defaultSize) as Record<number, Cohort[]>
          this.cohortsPages = paged
          this.currentPageCohorts = paged[0] ?? []
          this.pagination = {
            totalSize: cohorts.length,
            totalPages: Object.keys(paged).length,
            currentPage: 0,
            pageSize: defaultSize
          }
        }
          else {
          this.cohortsPages[page] = cohorts
          this.currentPageCohorts = cohorts
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size
          }
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar cohorts'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllCohortsAcrossPages(): Cohort[] {
      return flattenPages(this.cohortsPages)
    },

    async getCohortDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await CohortService.getById(id)
        this.currentCohort = Cohort.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do cohort'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveCohort(cohortData: Partial<Cohort>) {
      this.error = null
      try {
        const cohort = cohortData instanceof Cohort ? cohortData : new Cohort(cohortData)
        const dtoToSend = cohort.toDTO()

        console.log('Saving cohort with DTO:', dtoToSend)
        const savedDto = dtoToSend.id
          ? await CohortService.update(dtoToSend)
          : await CohortService.save(dtoToSend)

        const saved = Cohort.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (!this.cohortsPages[page]) {
          this.cohortsPages[page] = []
        }

        this.cohortsPages[page] = replaceOrInsert(this.cohortsPages[page], saved, 'name')
        this.currentPageCohorts = [...this.cohortsPages[page]]
        this.currentCohort = saved

        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar cohort'
        console.error(error)
        throw error
      }
    },

    async updateCohortLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await CohortService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedCohort = Cohort.fromDTO(updatedDto)

        for (const page in this.cohortsPages) {
          const index = this.cohortsPages[page].findIndex(c => c.uuid === uuid)
          if (index !== -1) {
            this.cohortsPages[page][index] = updatedCohort
          }
        }

        this.currentPageCohorts = this.cohortsPages[this.pagination.currentPage] ?? []

        if (this.currentCohort?.uuid === uuid) {
          this.currentCohort = updatedCohort
        }

        return updatedCohort
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do cohort'
        console.error(error)
        throw error
      }
    },

    async deleteCohort(uuid: string) {
      this.error = null
      try {
        await CohortService.delete(uuid)

        for (const page in this.cohortsPages) {
          this.cohortsPages[page] = this.cohortsPages[page].filter(c => c.uuid !== uuid)
        }

        this.currentPageCohorts = this.cohortsPages[this.pagination.currentPage] ?? []

        if (this.currentCohort?.uuid === uuid) {
          this.currentCohort = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar cohort'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
