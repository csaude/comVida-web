import { defineStore } from 'pinia'
import CohortMemberService from 'src/services/cohort/CohortMemberService'
import { CohortMember } from 'src/entities/cohort/CohortMember'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertError, alertSucess } = useSwal()

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
        cohortId?: number
        fileId?: number
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0
      const cohortId = params.cohortId
      const fileId = params.fileId
      const cacheKey =
        cohortId && fileId
          ? `${cohortId}-${fileId}-${page}`
          : cohortId
            ? `${cohortId}-${page}`
            : `all-${page}`

      if (this.cohortMembersPages[cacheKey]) {
        this.currentPageCohortMembers = this.cohortMembersPages[cacheKey]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        let response

        if (cohortId && fileId) {
          response =
            await CohortMemberService.findByCohortIdAndPatientImportFileId({
              page: params.page,
              size: params.size,
              sort: params.sort,
              cohortId,
              fileId,
            })
        } else if (cohortId) {
          response = await CohortMemberService.getAllByCohortId({
            page: params.page,
            size: params.size,
            sort: params.sort,
            cohortId,
          })
        } else {
          response = await CohortMemberService.getAll({
            page: params.page,
            size: params.size,
            sort: params.sort,
          })
        }

        const members = response.content.map((dto: any) =>
          CohortMember.fromDTO(dto),
        )

        this.cohortMembersPages[cacheKey] = members
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

    async allocateMember(memberId: number, assignedByUserId: number) {
      this.error = null
      this.loading = true
      try {
        const response = await CohortMemberService.allocateMember(
          memberId,
          assignedByUserId,
        )

        // O backend retorna { message, data: CohortMemberDTO }
        const allocated = CohortMember.fromDTO(response.data)

        // Atualiza caches
        for (const page in this.cohortMembersPages) {
          const index = this.cohortMembersPages[page].findIndex(
            (m) => m.id === allocated.id,
          )
          if (index !== -1) {
            this.cohortMembersPages[page][index] = allocated
          }
        }

        // Atualiza current
        if (this.currentCohortMember?.id === allocated.id) {
          this.currentCohortMember = allocated
        }

        return allocated
      } catch (error: any) {
        this.error = 'Erro ao alocar membro do cohort'
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async allocateMembers(memberIds: number[], volunteerId: number) {
      this.error = null
      this.loading = true
      try {
        const response = await CohortMemberService.allocateMembers(
          memberIds,
          volunteerId,
        )

        const updatedMembers = response.data.map((dto: any) =>
          CohortMember.fromDTO(dto),
        )

        // Atualizar cache corretamente
        for (const updated of updatedMembers) {
          for (const key in this.cohortMembersPages) {
            const index = this.cohortMembersPages[key].findIndex(
              (m) => m.id === updated.id,
            )
            if (index !== -1) {
              this.cohortMembersPages[key][index] = updated
            }
          }
        }

        // Atualizar a página atual com base na cacheKey certa
        const pageKey =
          this.pagination.currentPage !== undefined
            ? Object.keys(this.cohortMembersPages).find((key) =>
                key.endsWith(`-${this.pagination.currentPage}`),
              )
            : null

        if (pageKey) {
          this.currentPageCohortMembers = this.cohortMembersPages[pageKey]
        }

        alertSucess(response.message || 'Membro(s) alocado(s) com sucesso!')
        return updatedMembers
      } catch (error: any) {
        this.error = 'Erro ao alocar membros'
        alertError('Erro ao alocar membros')
        console.error(error)
        throw error
      } finally {
        this.loading = false
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
