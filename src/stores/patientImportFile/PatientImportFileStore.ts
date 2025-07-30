import { defineStore } from 'pinia'
import { PatientImportFile } from 'src/entities/patientImportFile/PatientImportFile'
import PatientImportFileService from 'src/services/patientImportFile/PatientImportFileService'
import { SheetImportStatus } from 'src/entities/patientImportFile/SheetImportStatus'

export const usePatientImportFileStore = defineStore('patientImportFile', {
  state: () => ({
    importFilesPages: {} as Record<number, PatientImportFile[]>,
    currentImportFiles: [] as PatientImportFile[],
    currentImportFile: null as PatientImportFile | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 20,
    },
    intervalId: null as ReturnType<typeof setInterval> | null,
    intervalTime: 5000,
    // Dentro do store
    sheetStatuses: [] as SheetImportStatus[],
    selectedImportFileId: null as number | null,
  }),

  actions: {
    async fetchImportFiles(
      params: {
        page?: number
        size?: number
        sort?: string
        name?: string
        status?: string
        ignoreCache?: boolean
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const status = params.status ?? ''
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = status !== ''
      const useCache = !ignoreCache && !isSearch

      if (useCache && this.importFilesPages[page]) {
        this.currentImportFiles = this.importFilesPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await PatientImportFileService.getPaginated({
          ...params,
          page,
          size,
          status,
          name,
        })

        const files = (response.content ?? []).map((dto: any) =>
          PatientImportFile.fromDTO(dto),
        )

        console.log('Fetched import files:', files)

        if (!isSearch) {
          this.importFilesPages[page] = files
        }

        this.currentImportFiles = files

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
        }

        // Se algum estiver em processamento, inicia/continua o polling
        const hasProcessing = files.some(
          (f: PatientImportFile) => f.status === 'PROCESSING',
        )

        if (hasProcessing && !this.intervalId) {
          this.intervalId = setInterval(() => {
            this.fetchImportFiles({ page, size, ignoreCache: true })
          }, this.intervalTime)
        }

        // Se nenhum estiver em processamento, para o polling
        if (!hasProcessing && this.intervalId) {
          clearInterval(this.intervalId)
          this.intervalId = null
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar arquivos importados'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getImportFileDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await PatientImportFileService.getById(id)
        this.currentImportFile = PatientImportFile.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do arquivo'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveImportFile(data: Partial<PatientImportFile>, file: File) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof PatientImportFile
            ? data.toDTO()
            : new PatientImportFile(data).toDTO()

        const formData = new FormData()
        formData.append('file', file)
        formData.append('dto', JSON.stringify(dtoToSend))

        const savedDto = await PatientImportFileService.uploadFile(formData)
        const saved = PatientImportFile.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.importFilesPages[page]) {
          const index = this.importFilesPages[page].findIndex(
            (f) => f.id === saved.id,
          )
          if (index !== -1) {
            this.importFilesPages[page][index] = saved
          } else {
            this.importFilesPages[page].push(saved)
          }
          this.currentImportFiles = this.importFilesPages[page]
        }

        this.currentImportFile = saved
        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar arquivo importado'
        console.error(
          'Erro ao salvar:',
          error.response?.data || error.message || error,
        )
        throw error
      }
    },

    async deleteImportFile(uuid: string) {
      try {
        await PatientImportFileService.delete(uuid)
        for (const page in this.importFilesPages) {
          this.importFilesPages[page] = this.importFilesPages[page].filter(
            (f) => f.uuid !== uuid,
          )
        }
        this.currentImportFiles =
          this.importFilesPages[this.pagination.currentPage] ?? []
      } catch (error: any) {
        this.error = 'Erro ao apagar ficheiro'
        throw error
      }
    },

    async fetchSheetStatuses(fileId: number) {
      this.loading = true
      try {
        const data = await PatientImportFileService.getSheetStatuses(fileId)
        this.sheetStatuses = data
        this.selectedImportFileId = fileId
        console.log('Sheet statuses:', this.sheetStatuses)
        console.log('Selected file ID:', this.selectedImportFileId)
        return data.map((dto: any) => SheetImportStatus.fromDTO(dto))
      } catch (error) {
        this.error = 'Erro ao buscar detalhes das sheets'
        console.error(error)
      } finally {
        this.loading = false
      }
    },
  },
})
