import { defineStore } from 'pinia'
import SourceSystemService from 'src/services/source/SourceSystemService'
import { SourceSystem } from 'src/entities/source/SourceSystem'

export const useSourceSystemStore = defineStore('sourceSystem', {
  state: () => ({
    sourceSystemsPages: {} as Record<number, SourceSystem[]>,
    currentPageSourceSystems: [] as SourceSystem[],
    currentSourceSystem: null as SourceSystem | null,
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
    async fetchSourceSystems(
      params: {
        page?: number
        size?: number
        sort?: string
        name?: string
        ignoreCache?: boolean
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = name.trim() !== ''
      const useCache = !ignoreCache && !isSearch

      if (useCache && this.sourceSystemsPages[page]) {
        this.currentPageSourceSystems = this.sourceSystemsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await SourceSystemService.getAll({
          ...params,
          page,
          size,
          name,
        })

        const sourceSystems = (response.content ?? []).map((dto: any) =>
          SourceSystem.fromDTO(dto),
        )

        if (!isSearch) {
          this.sourceSystemsPages[page] = sourceSystems
        }

        this.currentPageSourceSystems = sourceSystems

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar sistemas de origem'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getSourceSystemDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await SourceSystemService.getById(id)
        this.currentSourceSystem = SourceSystem.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do sistema de origem'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveSourceSystem(data: Partial<SourceSystem>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof SourceSystem
            ? data.toDTO()
            : new SourceSystem(data).toDTO()

        const savedDto = dtoToSend.id
          ? await SourceSystemService.update(dtoToSend)
          : await SourceSystemService.save(dtoToSend)

        const saved = SourceSystem.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.sourceSystemsPages[page]) {
          const index = this.sourceSystemsPages[page].findIndex(
            (s) => s.id === saved.id,
          )
          if (index !== -1) {
            this.sourceSystemsPages[page][index] = saved
          } else {
            this.sourceSystemsPages[page].push(saved)
          }
          this.currentPageSourceSystems = this.sourceSystemsPages[page]
        }

        this.currentSourceSystem = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar sistema de origem'
        console.error(
          'Erro ao salvar:',
          error.response?.data || error.message || error,
        )
        throw error
      }
    },

    async updateSourceSystemLifeCycleStatus(
      uuid: string,
      lifeCycleStatus: string,
    ) {
      this.error = null
      try {
        const updatedDto = await SourceSystemService.updateLifeCycleStatus(
          uuid,
          lifeCycleStatus,
        )
        const updated = SourceSystem.fromDTO(updatedDto)

        for (const page in this.sourceSystemsPages) {
          const index = this.sourceSystemsPages[page].findIndex(
            (s) => s.uuid === uuid,
          )
          if (index !== -1) {
            this.sourceSystemsPages[page][index] = updated
          }
        }

        this.currentPageSourceSystems =
          this.sourceSystemsPages[this.pagination.currentPage] ?? []

        if (this.currentSourceSystem?.uuid === uuid) {
          this.currentSourceSystem = updated
        }

        return updated
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do sistema de origem'
        console.error(error)
        throw error
      }
    },

    async deleteSourceSystem(uuid: string) {
      this.error = null
      try {
        await SourceSystemService.delete(uuid)

        for (const page in this.sourceSystemsPages) {
          this.sourceSystemsPages[page] = this.sourceSystemsPages[page].filter(
            (s) => s.uuid !== uuid,
          )
        }

        this.currentPageSourceSystems =
          this.sourceSystemsPages[this.pagination.currentPage] ?? []

        if (this.currentSourceSystem?.uuid === uuid) {
          this.currentSourceSystem = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar sistema de origem'

        this.error = apiMessage
        console.error(error)
        throw error
      }
    },
  },
})
