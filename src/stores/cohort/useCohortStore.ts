import { defineStore } from 'pinia'
import CohortService from 'src/services/cohort/CohortService'
import { Cohort } from 'src/entities/cohort/Cohort'

export const useCohortStore = defineStore('cohort', {
  state: () => ({
    cohortsPages: {} as Record<number, Cohort[]>, // cache por página
    currentPageCohorts: [] as Cohort[], // dados da página atual
    currentCohort: null as Cohort | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchCohorts(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.cohortsPages[page]) {
        this.currentPageCohorts = this.cohortsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await CohortService.getAll(params)
        const cohorts = response.content.map((dto: any) => Cohort.fromDTO(dto))

        this.cohortsPages[page] = cohorts
        this.currentPageCohorts = cohorts

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar cohorts'
        console.error(error)
      } finally {
        this.loading = false
      }
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
        const dtoToSend =
          cohortData instanceof Cohort
            ? cohortData.toDTO()
            : new Cohort(cohortData).toDTO()

        const savedDto = await CohortService.save(dtoToSend)
        const saved = Cohort.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.cohortsPages[page]) {
          const index = this.cohortsPages[page].findIndex(
            (c) => c.id === saved.id,
          )
          if (index !== -1) {
            this.cohortsPages[page][index] = saved
          } else {
            this.cohortsPages[page].push(saved)
          }
          this.currentPageCohorts = this.cohortsPages[page]
        }

        this.currentCohort = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar cohort'
        console.error(error)
      }
    },

    async deleteCohort(id: number) {
      this.error = null
      try {
        await CohortService.delete(id)

        for (const page in this.cohortsPages) {
          this.cohortsPages[page] = this.cohortsPages[page].filter(
            (c) => c.id !== id,
          )
        }
        this.currentPageCohorts =
          this.cohortsPages[this.pagination.currentPage] ?? []

        if (this.currentCohort?.id === id) {
          this.currentCohort = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar cohort'
        console.error(error)
      }
    },
  },
})
