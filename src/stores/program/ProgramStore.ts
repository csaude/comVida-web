import { defineStore } from 'pinia'
import ProgramService from 'src/services/program/programService'
import { Program } from 'src/entities/program/Program'

export const useProgramStore = defineStore('program', {
  state: () => ({
    programsPages: {} as Record<number, Program[]>, // cache de páginas
    currentPagePrograms: [] as Program[],
    currentProgram: null as Program | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100
    }
  }),

  actions: {
    async fetchPrograms(
        params: {
            page?: number
            size?: number
            sort?: string
            name?: string
            ignoreCache?: boolean
            [key: string]: any
        } = {}
    ) {
        console.log('Fetching programs with params:', params)

        const page = params.page ?? 0
        const size = params.size ?? this.pagination.pageSize
        const name = params.name ?? ''
        const ignoreCache = params.ignoreCache ?? false

        const isSearch = name.trim() !== ''
        const useCache = !ignoreCache && !isSearch

        if (useCache && this.programsPages[page]) {
            this.currentPagePrograms = this.programsPages[page]
            this.pagination.currentPage = page
            return
        }

        this.loading = true
        this.error = null

        try {
            const response = await ProgramService.getAll({ ...params, page, size, name })

            // Se response.content for undefined, use []
            const programs = (response.content ?? []).map((dto: any) =>
                Program.fromDTO(dto)
            )

            if (!isSearch) {
                this.programsPages[page] = programs
            }

            this.currentPagePrograms = programs

            this.pagination = {
                totalSize: response.total,
                totalPages: Math.ceil(response.total / size),
                currentPage: response.page,
                pageSize: response.size
            }
        } catch (error: any) {
            this.error = 'Erro ao buscar programas'
            console.error(error)
        } finally {
            this.loading = false
        }
    },

    async getProgramDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await ProgramService.getById(id)
        this.currentProgram = Program.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do programa'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveProgram(programData: Partial<Program>) {
      this.error = null
      try {
        const dtoToSend =
          programData instanceof Program
            ? programData.toDTO()
            : new Program(programData).toDTO()

        const savedDto = dtoToSend.id
          ? await ProgramService.update(dtoToSend)
          : await ProgramService.save(dtoToSend)

        const saved = Program.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.programsPages[page]) {
          const index = this.programsPages[page].findIndex(
            (p) => p.id === saved.id
          )
          if (index !== -1) {
            this.programsPages[page][index] = saved
          } else {
            this.programsPages[page].push(saved)
          }
          this.currentPagePrograms = this.programsPages[page]
        }

        this.currentProgram = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar programa'
        console.error('Erro ao salvar programa:', error.response?.data || error.message || error)

        throw error // 👈 IMPORTANTE → para o componente poder mostrar alertError
      }
    },

    async updateProgramLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await ProgramService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedProgram = Program.fromDTO(updatedDto)

        // Atualizar na cache:
        for (const page in this.programsPages) {
          const index = this.programsPages[page].findIndex(p => p.uuid === uuid)
          if (index !== -1) {
            this.programsPages[page][index] = updatedProgram
          }
        }

        this.currentPagePrograms =
          this.programsPages[this.pagination.currentPage] ?? []

        if (this.currentProgram?.uuid === uuid) {
          this.currentProgram = updatedProgram
        }

        return updatedProgram
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do programa'
        console.error(error)
        throw error
      }
    },
    async deleteProgram(uuid: string) {
      this.error = null
      try {
        await ProgramService.delete(uuid)

        for (const page in this.programsPages) {
          this.programsPages[page] = this.programsPages[page].filter(
            (p) => p.uuid !== uuid
          )
        }

        this.currentPagePrograms =
          this.programsPages[this.pagination.currentPage] ?? []

        if (this.currentProgram?.uuid === uuid) {
          this.currentProgram = null
        }
      } catch (error: any) {
        // Se a API retornar uma mensagem de erro, usa ela
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar programa'

        this.error = apiMessage

        console.error(error)

        // Opcional: relança o erro para que o seu handleApiError no componente possa tratar
        throw error
      }
    }

  }
})
