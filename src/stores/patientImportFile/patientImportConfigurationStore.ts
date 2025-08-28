import { defineStore } from 'pinia'
import PatientImportConfigurationService from 'src/services/patientImportFile/patientImportConfigurationService'
import { PatientImportConfiguration } from 'src/entities/patientImportFile/PatientImportConfiguration'
import { useSwal } from 'src/composables/shared/dialog/dialog'

const { alertWarningAction, alertError, alertInfo, alertSucess } = useSwal()

export const usePatientImportConfigurationStore = defineStore(
  'patientImportConfiguration',
  {
    state: () => ({
      patientImportConfigurationsPages: {} as Record<
        number,
        PatientImportConfiguration[]
      >,
      currentPagePatientImportConfigurations:
        [] as PatientImportConfiguration[],
      currentPatientImportConfiguration:
        null as PatientImportConfiguration | null,
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
      async fetchConfigurations(
        params: {
          page?: number
          size?: number
          sort?: string
          ProgramActivityId?: string
          GroupId?: string
          ignoreCache?: boolean
          [key: string]: any
        } = {},
      ) {
        const page = params.page ?? 0
        const size = params.size ?? this.pagination.pageSize
        const ProgramActivityId = params.ProgramActivityId ?? ''
        const GroupId = params.GroupId ?? ''
        const ignoreCache = params.ignoreCache ?? false

        const isSearch = ProgramActivityId.trim() !== ''
        const useCache = !ignoreCache && !isSearch

        if (useCache && this.patientImportConfigurationsPages[page]) {
          this.currentPagePatientImportConfigurations =
            this.patientImportConfigurationsPages[page]
          this.pagination.currentPage = page
          return
        }

        this.loading = true
        this.error = null

        try {
          const response = await PatientImportConfigurationService.getAll({
            ...params,
            page,
            size,
            ProgramActivityId,
            GroupId,
          })
          const configurations = (response.content ?? []).map((dto: any) =>
            PatientImportConfiguration.fromDTO(dto),
          )

          if (!isSearch) {
            this.patientImportConfigurationsPages[page] = configurations
          }

          this.currentPagePatientImportConfigurations = configurations
          this.pagination = {
            totalSize: response.total,
            totalPages: Math.ceil(response.total / size),
            currentPage: response.page,
            pageSize: response.size,
          }
        } catch (error: any) {
          this.error = 'Erro ao buscar configurações de importação de pacientes'
          console.error(error)
        } finally {
          this.loading = false
        }
      },

      async getConfigurationDetails(id: number) {
        this.loading = true
        this.error = null
        try {
          const dto = await PatientImportConfigurationService.getById(id)
          this.currentPatientImportConfiguration =
            PatientImportConfiguration.fromDTO(dto)
        } catch (error: any) {
          this.error = 'Erro ao buscar detalhes da configuração'
          console.error(error)
        } finally {
          this.loading = false
        }
      },

      async saveConfiguration(configData: Partial<PatientImportConfiguration>) {
        this.error = null
        try {
          const dtoToSend =
            configData instanceof PatientImportConfiguration
              ? configData.toDTO()
              : new PatientImportConfiguration(configData).toDTO()

          const savedDto = dtoToSend.id
            ? await PatientImportConfigurationService.update(dtoToSend)
            : await PatientImportConfigurationService.save(dtoToSend)

          const saved = PatientImportConfiguration.fromDTO(savedDto)
          const page = this.pagination.currentPage

          if (this.patientImportConfigurationsPages[page]) {
            const index = this.patientImportConfigurationsPages[page].findIndex(
              (c) => c.id === saved.id,
            )
            if (index !== -1) {
              this.patientImportConfigurationsPages[page][index] = saved
            } else {
              this.patientImportConfigurationsPages[page].push(saved)
            }
            this.currentPagePatientImportConfigurations =
              this.patientImportConfigurationsPages[page]
          }

          this.currentPatientImportConfiguration = saved
          return saved
        } catch (error: any) {
          this.error = 'Erro ao salvar configuração'
          console.error(error)
          throw error
        }
      },

      async scheduleConfigurationDates(params: {
        cohortId: number
        patientImportFileId: number
        entryDate?: string
        exitDate?: string
      }) {
        this.loading = true
        this.error = null
        try {
          const updatedDto =
            await PatientImportConfigurationService.scheduleDates(params)
          const updated = PatientImportConfiguration.fromDTO(updatedDto)

          // Atualiza a lista em cache se existir
          for (const page in this.patientImportConfigurationsPages) {
            const index = this.patientImportConfigurationsPages[page].findIndex(
              (c) => c.id === updated.id,
            )
            if (index !== -1) {
              this.patientImportConfigurationsPages[page][index] = updated
            }
          }

          // Atualiza a página atual e o detalhe atual se necessário
          this.currentPagePatientImportConfigurations =
            this.patientImportConfigurationsPages[
              this.pagination.currentPage
            ] ?? []
          if (this.currentPatientImportConfiguration?.id === updated.id) {
            this.currentPatientImportConfiguration = updated
          }

          return updated
        } catch (error: any) {
          this.error =
            error?.response?.data?.message ||
            'Erro ao agendar datas da configuração'
          console.error(error)
          throw error
        } finally {
          this.loading = false
        }
      },

      async deleteConfiguration(uuid: string) {
        this.error = null
        try {
          await PatientImportConfigurationService.delete(uuid)

          for (const page in this.patientImportConfigurationsPages) {
            this.patientImportConfigurationsPages[page] =
              this.patientImportConfigurationsPages[page].filter(
                (c) => c.uuid !== uuid,
              )
          }

          this.currentPagePatientImportConfigurations =
            this.patientImportConfigurationsPages[
              this.pagination.currentPage
            ] ?? []

          if (this.currentPatientImportConfiguration?.uuid === uuid) {
            this.currentPatientImportConfiguration = null
          }
        } catch (error: any) {
          const apiMessage =
            error?.response?.data?.message || 'Erro ao apagar configuração'
          this.error = apiMessage
          console.error(error)
          throw error
        }
      },
    },
  },
)
