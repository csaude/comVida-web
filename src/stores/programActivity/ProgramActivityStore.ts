import { defineStore } from 'pinia'
import ProgramActivityService from 'src/services/programActivity/programActivityService'
import { ProgramActivity } from 'src/entities/programActivity/ProgramActivity'

export const useProgramActivityStore = defineStore('programActivity', {
  state: () => ({
    activitiesPages: {} as Record<number, ProgramActivity[]>,
    currentPageActivities: [] as ProgramActivity[],
    currentActivity: null as ProgramActivity | null,
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
    async fetchActivities(params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = name.trim() !== ''
      const useCache = !ignoreCache && !isSearch

      if (useCache && this.activitiesPages[page]) {
        this.currentPageActivities = this.activitiesPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await ProgramActivityService.getAll({ ...params, page, size, name })
        const activities = (response.content ?? []).map((dto: any) =>
          ProgramActivity.fromDTO(dto)
        )

        if (!isSearch) {
          this.activitiesPages[page] = activities
        }

        this.currentPageActivities = activities
        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar atividades do programa'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getActivityDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await ProgramActivityService.getById(id)
        this.currentActivity = ProgramActivity.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes da atividade'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveActivity(activityData: Partial<ProgramActivity>) {
      this.error = null
      try {
        const dtoToSend =
          activityData instanceof ProgramActivity
            ? activityData.toDTO()
            : new ProgramActivity(activityData).toDTO()


        const savedDto = dtoToSend.id
          ? await ProgramActivityService.update(dtoToSend)
          : await ProgramActivityService.save(dtoToSend)

        const saved = ProgramActivity.fromDTO(savedDto)
        const page = this.pagination.currentPage
        if (this.activitiesPages[page]) {
          const index = this.activitiesPages[page].findIndex(a => a.id === saved.id)
          if (index !== -1) {
            this.activitiesPages[page][index] = saved
          } else {
            this.activitiesPages[page].push(saved)
          }
          this.currentPageActivities = this.activitiesPages[page]
        }

        this.currentActivity = saved
        return saved 
      } catch (error: any) {
        this.error = 'Erro ao salvar atividade'
        console.error(error)
        throw error
      }
    },

    async updateActivityLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await ProgramActivityService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedActivity = ProgramActivity.fromDTO(updatedDto)

        for (const page in this.activitiesPages) {
          const index = this.activitiesPages[page].findIndex(a => a.uuid === uuid)
          if (index !== -1) {
            this.activitiesPages[page][index] = updatedActivity
          }
        }

        this.currentPageActivities = this.activitiesPages[this.pagination.currentPage] ?? []

        if (this.currentActivity?.uuid === uuid) {
          this.currentActivity = updatedActivity
        }

        return updatedActivity
      } catch (error: any) {
        this.error = 'Erro ao atualizar status da atividade'
        console.error(error)
        throw error
      }
    },

    async deleteActivity(uuid: string) {
      this.error = null
      try {
        await ProgramActivityService.delete(uuid)

        for (const page in this.activitiesPages) {
          this.activitiesPages[page] = this.activitiesPages[page].filter(
            (a) => a.uuid !== uuid
          )
        }

        this.currentPageActivities = this.activitiesPages[this.pagination.currentPage] ?? []

        if (this.currentActivity?.uuid === uuid) {
          this.currentActivity = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar atividade'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
