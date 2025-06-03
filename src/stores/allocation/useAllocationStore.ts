import { defineStore } from 'pinia'
import AllocationService from 'src/services/allocation/AllocationService'
import { Allocation } from 'src/entities/allocation/Allocation'

export const useAllocationStore = defineStore('allocation', {
  state: () => ({
    allocationsPages: {} as Record<number, Allocation[]>, // cache das páginas
    currentPageAllocations: [] as Allocation[], // página atual
    currentAllocation: null as Allocation | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchAllocations(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      if (this.allocationsPages[page]) {
        this.currentPageAllocations = this.allocationsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await AllocationService.getAll(params)
        const allocations = response.content.map((dto: any) =>
          Allocation.fromDTO(dto),
        )

        this.allocationsPages[page] = allocations
        this.currentPageAllocations = allocations

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar alocações'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getAllocationDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await AllocationService.getById(id)
        this.currentAllocation = Allocation.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da alocação'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveAllocation(data: Partial<Allocation>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof Allocation
            ? data.toDTO()
            : new Allocation(data).toDTO()
        const savedDto = await AllocationService.save(dtoToSend)
        const saved = Allocation.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.allocationsPages[page]) {
          const index = this.allocationsPages[page].findIndex(
            (a) => a.id === saved.id,
          )
          if (index !== -1) {
            this.allocationsPages[page][index] = saved
          } else {
            this.allocationsPages[page].push(saved)
          }
          this.currentPageAllocations = this.allocationsPages[page]
        }

        this.currentAllocation = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar alocação'
        console.error(error)
      }
    },

    async deleteAllocation(id: number) {
      this.error = null
      try {
        await AllocationService.delete(id)

        for (const page in this.allocationsPages) {
          this.allocationsPages[page] = this.allocationsPages[page].filter(
            (a) => a.id !== id,
          )
        }
        this.currentPageAllocations =
          this.allocationsPages[this.pagination.currentPage] ?? []

        if (this.currentAllocation?.id === id) {
          this.currentAllocation = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar alocação'
        console.error(error)
      }
    },
  },
})
