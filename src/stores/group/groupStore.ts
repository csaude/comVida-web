import { defineStore } from 'pinia'
import GroupService from 'src/services/group/groupService'
import { Group } from 'src/entities/group/Group'

export const useGroupStore = defineStore('group', {
  state: () => ({
    groupsPages: {} as Record<number, Group[]>,
    currentPageGroups: [] as Group[],
    currentGroup: null as Group | null,
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
    async fetchGroups(params: {
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

      if (useCache && this.groupsPages[page]) {
        this.currentPageGroups = this.groupsPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await GroupService.getAll({ ...params, page, size, name })
        const groups = (response.content ?? []).map((dto: any) =>
          Group.fromDTO(dto)
        )

        if (!isSearch) {
          this.groupsPages[page] = groups
        }

        this.currentPageGroups = groups
        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar grupos'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getGroupDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await GroupService.getById(id)
        this.currentGroup = Group.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do grupo'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveGroup(groupData: Partial<Group>) {
      this.error = null
      try {
        const dtoToSend =
          groupData instanceof Group
            ? groupData.toDTO()
            : new Group(groupData).toDTO()

        const savedDto = dtoToSend.id
          ? await GroupService.update(dtoToSend)
          : await GroupService.save(dtoToSend)

        const saved = Group.fromDTO(savedDto)
        const page = this.pagination.currentPage

        if (this.groupsPages[page]) {
          const index = this.groupsPages[page].findIndex(g => g.id === saved.id)
          if (index !== -1) {
            this.groupsPages[page][index] = saved
          } else {
            this.groupsPages[page].push(saved)
          }
          this.currentPageGroups = this.groupsPages[page]
        }

        this.currentGroup = saved
        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar grupo'
        console.error(error)
        throw error
      }
    },

    async updateGroupLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await GroupService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedGroup = Group.fromDTO(updatedDto)

        for (const page in this.groupsPages) {
          const index = this.groupsPages[page].findIndex(g => g.uuid === uuid)
          if (index !== -1) {
            this.groupsPages[page][index] = updatedGroup
          }
        }

        this.currentPageGroups = this.groupsPages[this.pagination.currentPage] ?? []

        if (this.currentGroup?.uuid === uuid) {
          this.currentGroup = updatedGroup
        }

        return updatedGroup
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do grupo'
        console.error(error)
        throw error
      }
    },

    async deleteGroup(uuid: string) {
      this.error = null
      try {
        await GroupService.delete(uuid)

        for (const page in this.groupsPages) {
          this.groupsPages[page] = this.groupsPages[page].filter(
            (g) => g.uuid !== uuid
          )
        }

        this.currentPageGroups = this.groupsPages[this.pagination.currentPage] ?? []

        if (this.currentGroup?.uuid === uuid) {
          this.currentGroup = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar grupo'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
