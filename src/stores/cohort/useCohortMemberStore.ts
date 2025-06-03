import { defineStore } from 'pinia'
import CohortMemberService from 'src/services/cohort/CohortMemberService'
import { CohortMember } from 'src/entities/cohort/CohortMember'

export const useCohortMemberStore = defineStore('cohortMember', {
  state: () => ({
    cohortMembersPages: {} as Record<number, CohortMember[]>, // cache
    currentPageCohortMembers: [] as CohortMember[], // página atual
    currentCohortMember: null as CohortMember | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchCohortMembers(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.cohortMembersPages[page]) {
        this.currentPageCohortMembers = this.cohortMembersPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await CohortMemberService.getAll(params)
        const members = response.content.map((dto: any) =>
          CohortMember.fromDTO(dto),
        )

        this.cohortMembersPages[page] = members
        this.currentPageCohortMembers = members

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar membros do cohort'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getCohortMemberDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await CohortMemberService.getById(id)
        this.currentCohortMember = CohortMember.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do membro do cohort'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveCohortMember(data: Partial<CohortMember>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof CohortMember
            ? data.toDTO()
            : new CohortMember(data).toDTO()

        const savedDto = await CohortMemberService.save(dtoToSend)
        const saved = CohortMember.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.cohortMembersPages[page]) {
          const index = this.cohortMembersPages[page].findIndex(
            (m) => m.id === saved.id,
          )
          if (index !== -1) {
            this.cohortMembersPages[page][index] = saved
          } else {
            this.cohortMembersPages[page].push(saved)
          }
          this.currentPageCohortMembers = this.cohortMembersPages[page]
        }

        this.currentCohortMember = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar membro do cohort'
        console.error(error)
      }
    },

    async deleteCohortMember(id: number) {
      this.error = null
      try {
        await CohortMemberService.delete(id)

        for (const page in this.cohortMembersPages) {
          this.cohortMembersPages[page] = this.cohortMembersPages[page].filter(
            (m) => m.id !== id,
          )
        }
        this.currentPageCohortMembers =
          this.cohortMembersPages[this.pagination.currentPage] ?? []

        if (this.currentCohortMember?.id === id) {
          this.currentCohortMember = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar membro do cohort'
        console.error(error)
      }
    },
  },
})
