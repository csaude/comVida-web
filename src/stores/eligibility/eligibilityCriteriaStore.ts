import { defineStore } from 'pinia'
import EligibilityCriteriaService from 'src/services/eligibility/EligibilityCriteriaService'
import { EligibilityCriteria } from 'src/entities/eligibility/EligibilityCriteria'
import { paginateArray, flattenPages } from 'src/utils/paginationUtils'

export const useEligibilityCriteriaStore = defineStore('eligibilityCriteria', {
  state: () => ({
    criteriaPages: {} as Record<number, EligibilityCriteria[]>,
    currentPageCriterias: [] as EligibilityCriteria[],
    currentCriteria: null as EligibilityCriteria | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100,
    },
  }),

  actions: {
    async fetchCriterias(
      params: {
        page?: number
        size?: number
        sort?: string
        criteria?: string
        ignoreCache?: boolean
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const criteria = params.criteria ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = criteria.trim() !== ''
      const useCache = !ignoreCache && !isSearch

      if (useCache && this.criteriaPages[page]) {
        this.currentPageCriterias = this.criteriaPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await EligibilityCriteriaService.getAll({
          ...params,
          page,
          size,
          criteria: criteria.trim() || undefined, // Trim and handle empty search
        })
        const criteriaList = (response.content ?? []).map((dto: any) =>
          EligibilityCriteria.fromDTO ? EligibilityCriteria.fromDTO(dto) : dto,
        )

        if (!isSearch) {
          this.criteriaPages[page] = criteriaList
        }

        this.currentPageCriterias = criteriaList
        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar critérios de elegibilidade'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    getAllCriteriasAcrossPages(): EligibilityCriteria[] {
      return flattenPages(this.criteriaPages)
    },

    async getCriteriaDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await EligibilityCriteriaService.getById(id)
        this.currentCriteria = EligibilityCriteria.fromDTO
          ? EligibilityCriteria.fromDTO(dto)
          : dto
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do critério'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveCriteria(data: Partial<EligibilityCriteria>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof EligibilityCriteria
            ? data.toDTO?.() || data
            : new EligibilityCriteria(data).toDTO?.() || data

        const savedDto = dtoToSend.id
          ? await EligibilityCriteriaService.update(dtoToSend)
          : await EligibilityCriteriaService.save(dtoToSend)

        const saved = EligibilityCriteria.fromDTO
          ? EligibilityCriteria.fromDTO(savedDto)
          : savedDto

        const page = this.pagination.currentPage
        if (this.criteriaPages[page]) {
          const index = this.criteriaPages[page].findIndex(
            (c) => c.id === saved.id,
          )
          if (index !== -1) {
            this.criteriaPages[page][index] = saved
          } else {
            this.criteriaPages[page].push(saved)
          }
          this.currentPageCriterias = this.criteriaPages[page]
        }

        this.currentCriteria = saved
        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar critério de elegibilidade'
        console.error(error)
        throw error
      }
    },

    async deleteCriteria(uuid: string) {
      this.error = null
      try {
        await EligibilityCriteriaService.delete(uuid)

        for (const page in this.criteriaPages) {
          this.criteriaPages[page] = this.criteriaPages[page].filter(
            (c) => c.uuid !== uuid,
          )
        }

        this.currentPageCriterias =
          this.criteriaPages[this.pagination.currentPage] ?? []

        if (this.currentCriteria?.uuid === uuid) {
          this.currentCriteria = null
        }
      } catch (error: any) {
        const msg = error?.response?.data?.message || 'Erro ao apagar critério'
        this.error = msg
        console.error(error)
        throw error
      }
    },
  },
})
