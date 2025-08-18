import { defineStore } from 'pinia'
import UserServiceRoleGroupService from 'src/services/userServiceRoleGroup/userServiceRoleGroupService'
import { UserServiceRoleGroup } from 'src/entities/userServiceRoleGroup/UserServiceRoleGroup'

export const useUserServiceRoleGroupStore = defineStore('userServiceRoleGroup', {
  state: () => ({
    pages: {} as Record<number, UserServiceRoleGroup[]>,
    currentPageItems: [] as UserServiceRoleGroup[],
    current: null as UserServiceRoleGroup | null,
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
    async fetchAll(params: {
      page?: number
      size?: number
      sort?: string
      userServiceRoleUuid?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const ignoreCache = params.ignoreCache ?? false

      const isFiltered = !!params.userServiceRoleUuid
      const useCache = !ignoreCache && !isFiltered

      if (useCache && this.pages[page]) {
        this.currentPageItems = this.pages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await UserServiceRoleGroupService.getAll({ ...params, page, size })
        const rows = (response.content ?? []).map((dto: any) => UserServiceRoleGroup.fromDTO(dto))

        if (!isFiltered) this.pages[page] = rows
        this.currentPageItems = rows

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (e: any) {
        this.error = 'Erro ao buscar grupos do vínculo'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async getDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await UserServiceRoleGroupService.getById(id)
        this.current = UserServiceRoleGroup.fromDTO(dto)
      } catch (e: any) {
        this.error = 'Erro ao buscar detalhes'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async save(data: Partial<UserServiceRoleGroup>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof UserServiceRoleGroup ? data.toDTO() : new UserServiceRoleGroup(data).toDTO()

        const savedDto = dtoToSend.id
          ? await UserServiceRoleGroupService.update(dtoToSend)
          : await UserServiceRoleGroupService.save(dtoToSend)

        const saved = UserServiceRoleGroup.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.pages[page]) {
          const idx = this.pages[page].findIndex(u => u.id === saved.id)
          if (idx !== -1) this.pages[page][idx] = saved
          else this.pages[page].push(saved)
          this.currentPageItems = this.pages[page]
        }

        this.current = saved
      } catch (e: any) {
        this.error = 'Erro ao salvar registro'
        console.error(e?.response?.data || e.message || e)
        throw e
      }
    },

    async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await UserServiceRoleGroupService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updated = UserServiceRoleGroup.fromDTO(updatedDto)

        for (const p in this.pages) {
          const idx = this.pages[p].findIndex(u => u.uuid === uuid)
          if (idx !== -1) this.pages[p][idx] = updated
        }
        this.currentPageItems = this.pages[this.pagination.currentPage] ?? []
        if (this.current?.uuid === uuid) this.current = updated

        return updated
      } catch (e: any) {
        this.error = 'Erro ao atualizar status'
        console.error(e)
        throw e
      }
    },

    async delete(uuid: string) {
      this.error = null
      try {
        await UserServiceRoleGroupService.delete(uuid)

        for (const p in this.pages) {
          this.pages[p] = this.pages[p].filter(u => u.uuid !== uuid)
        }
        this.currentPageItems = this.pages[this.pagination.currentPage] ?? []
        if (this.current?.uuid === uuid) this.current = null
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao apagar registro'
        console.error(e)
        throw e
      }
    }
  }
})
