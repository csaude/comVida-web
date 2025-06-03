import { defineStore } from 'pinia'
import ConceptService from 'src/services/concept/ConceptService'
import { Concept } from 'src/entities/concept/Concept'

export const useConceptStore = defineStore('concept', {
  state: () => ({
    conceptsPages: {} as Record<number, Concept[]>, // cache por página
    currentPageConcepts: [] as Concept[], // dados da página atual
    currentConcept: null as Concept | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchConcepts(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.conceptsPages[page]) {
        this.currentPageConcepts = this.conceptsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await ConceptService.getAll(params)
        const concepts = response.content.map((dto: any) =>
          Concept.fromDTO(dto),
        )

        this.conceptsPages[page] = concepts
        this.currentPageConcepts = concepts

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar conceitos'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getConceptDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await ConceptService.getById(id)
        this.currentConcept = Concept.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do conceito'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveConcept(data: Partial<Concept>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof Concept ? data.toDTO() : new Concept(data).toDTO()

        const savedDto = await ConceptService.save(dtoToSend)
        const saved = Concept.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.conceptsPages[page]) {
          const index = this.conceptsPages[page].findIndex(
            (c) => c.id === saved.id,
          )
          if (index !== -1) {
            this.conceptsPages[page][index] = saved
          } else {
            this.conceptsPages[page].push(saved)
          }
          this.currentPageConcepts = this.conceptsPages[page]
        }

        this.currentConcept = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar conceito'
        console.error(error)
      }
    },

    async deleteConcept(id: number) {
      this.error = null
      try {
        await ConceptService.delete(id)

        for (const page in this.conceptsPages) {
          this.conceptsPages[page] = this.conceptsPages[page].filter(
            (c) => c.id !== id,
          )
        }
        this.currentPageConcepts =
          this.conceptsPages[this.pagination.currentPage] ?? []

        if (this.currentConcept?.id === id) {
          this.currentConcept = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar conceito'
        console.error(error)
      }
    },
  },
})
