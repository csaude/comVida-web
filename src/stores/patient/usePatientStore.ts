import { defineStore } from 'pinia'
import PatientService from 'src/services/patient/PatientService'
import { Patient } from 'src/entities/patient/Patient'

export const usePatientStore = defineStore('patient', {
  state: () => ({
    patientsPages: {} as Record<number, Patient[]>, // cache das páginas, chave: número da página
    currentPagePatients: [] as Patient[], // pacientes da página atual
    currentPatient: null as Patient | null,
    loading: false,
    error: null as string | null,
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
    },
  }),

  actions: {
    async fetchPatients(
      params: {
        page?: number
        size?: number
        sort?: string
        [key: string]: any
      } = {},
    ) {
      const page = params.page ?? 0

      // se a página já está cacheada, usa do cache e não vai ao backend
      if (this.patientsPages[page]) {
        this.currentPagePatients = this.patientsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await PatientService.getAll(params)
        const patients = response.content.map((dto: any) =>
          Patient.fromDTO(dto),
        )

        // salva no cache
        this.patientsPages[page] = patients
        this.currentPagePatients = patients

        this.pagination = {
          totalSize: response.totalSize,
          totalPages: response.totalPages,
          currentPage: response.number,
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar pacientes'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getPatientDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await PatientService.getById(id)
        this.currentPatient = Patient.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do paciente'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async savePatient(data: Partial<Patient>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof Patient ? data.toDTO() : new Patient(data).toDTO()

        const savedDto = await PatientService.save(dtoToSend)
        const saved = Patient.fromDTO(savedDto)

        // Atualiza o paciente na página atual (se existir)
        const page = this.pagination.currentPage
        if (this.patientsPages[page]) {
          const index = this.patientsPages[page].findIndex(
            (p) => p.id === saved.id,
          )
          if (index !== -1) {
            this.patientsPages[page][index] = saved
          } else {
            this.patientsPages[page].push(saved)
          }
          this.currentPagePatients = this.patientsPages[page]
        }

        this.currentPatient = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar paciente'
        console.error(error)
      }
    },

    async deletePatient(id: number) {
      this.error = null
      try {
        await PatientService.delete(id)

        // Remove de todas as páginas no cache
        for (const page in this.patientsPages) {
          this.patientsPages[page] = this.patientsPages[page].filter(
            (p) => p.id !== id,
          )
        }
        this.currentPagePatients =
          this.patientsPages[this.pagination.currentPage] ?? []

        if (this.currentPatient?.id === id) {
          this.currentPatient = null
        }
      } catch (error: any) {
        this.error = 'Erro ao apagar paciente'
        console.error(error)
      }
    },
  },
})
