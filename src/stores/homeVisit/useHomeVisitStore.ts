import { defineStore } from 'pinia'
import HomeVisitService from 'src/services/homeVisit/HomeVisitService'
import { HomeVisit } from 'src/entities/homeVisit/HomeVisit'

export const useHomeVisitStore = defineStore('homeVisit', {
  state: () => ({
    homeVisitPages: {} as Record<number, HomeVisit[]>, // cache por página
    currentPageHomeVisits: [] as HomeVisit[],
    currentHomeVisit: null as HomeVisit | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchHomeVisits(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.homeVisitPages[page]) {
        this.currentPageHomeVisits = this.homeVisitPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await HomeVisitService.getAll(params)
        const homeVisits = response.content.map((dto: any) =>
          HomeVisit.fromDTO(dto),
        )

        this.homeVisitPages[page] = homeVisits
        this.currentPageHomeVisits = homeVisits

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar visitas domiciliares'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getHomeVisitDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await HomeVisitService.getById(id)
        this.currentHomeVisit = HomeVisit.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da visita domiciliar'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveHomeVisit(data: Partial<HomeVisit>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof HomeVisit ? data.toDTO() : new HomeVisit(data).toDTO()

        const savedDto = await HomeVisitService.save(dtoToSend)
        const saved = HomeVisit.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.homeVisitPages[page]) {
          const index = this.homeVisitPages[page].findIndex(
            (h) => h.id === saved.id,
          )
          if (index !== -1) {
            this.homeVisitPages[page][index] = saved
          } else {
            this.homeVisitPages[page].push(saved)
          }
          this.currentPageHomeVisits = this.homeVisitPages[page]
        }

        this.currentHomeVisit = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar visita domiciliar'
        console.error(error)
      }
    },

    async deleteHomeVisit(id: number) {
      this.error = null
      try {
        await HomeVisitService.delete(id)

        for (const page in this.homeVisitPages) {
          this.homeVisitPages[page] = this.homeVisitPages[page].filter(
            (h) => h.id !== id,
          )
        }
        this.currentPageHomeVisits =
          this.homeVisitPages[this.pagination.currentPage] ?? []

        if (this.currentHomeVisit?.id === id) {
          this.currentHomeVisit = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar visita domiciliar'
        console.error(error)
      }
    },
  },
})
