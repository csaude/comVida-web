import { defineStore } from 'pinia'
import UserServiceRoleService from 'src/services/userServiceRole/userServiceRoleService'
import { UserServiceRole } from 'src/entities/userServiceRole/UserServiceRole'

export const useUserServiceRoleStore = defineStore('userServiceRole', {
  state: () => ({
    pages: {} as Record<number, UserServiceRole[]>,
    currentPageItems: [] as UserServiceRole[],
    current: null as UserServiceRole | null,
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
      userUuid?: string
      roleUuid?: string
      programActivityUuid?: string
      ignoreCache?: boolean
      [key: string]: any
    } = {}) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const ignoreCache = params.ignoreCache ?? false

      const isFiltered =
        !!(params.userUuid || params.roleUuid || params.programActivityUuid)
      const useCache = !ignoreCache && !isFiltered

      if (useCache && this.pages[page]) {
        this.currentPageItems = this.pages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await UserServiceRoleService.getAll({ ...params, page, size })
        const rows = (response.content ?? []).map((dto: any) => UserServiceRole.fromDTO(dto))

        if (!isFiltered) this.pages[page] = rows
        this.currentPageItems = rows

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (e: any) {
        this.error = 'Erro ao buscar vínculos de roles'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async getDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await UserServiceRoleService.getById(id)
        this.current = UserServiceRole.fromDTO(dto)
      } catch (e: any) {
        this.error = 'Erro ao buscar detalhes'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async save(data: Partial<UserServiceRole>) {
      this.error = null
      try {
        const dtoToSend =
          data instanceof UserServiceRole ? data.toDTO() : new UserServiceRole(data).toDTO()

        const savedDto = dtoToSend.id
          ? await UserServiceRoleService.update(dtoToSend)
          : await UserServiceRoleService.save(dtoToSend)

        const saved = UserServiceRole.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.pages[page]) {
          const idx = this.pages[page].findIndex(u => u.id === saved.id)
          if (idx !== -1) this.pages[page][idx] = saved
          else this.pages[page].push(saved)
          this.currentPageItems = this.pages[page]
        }

        this.current = saved
      } catch (e: any) {
        this.error = 'Erro ao salvar vínculo'
        console.error(e?.response?.data || e.message || e)
        throw e
      }
    },

    async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await UserServiceRoleService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updated = UserServiceRole.fromDTO(updatedDto)

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
        await UserServiceRoleService.delete(uuid)

        for (const p in this.pages) {
          this.pages[p] = this.pages[p].filter(u => u.uuid !== uuid)
        }
        this.currentPageItems = this.pages[this.pagination.currentPage] ?? []
        if (this.current?.uuid === uuid) this.current = null
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao apagar vínculo'
        console.error(e)
        throw e
      }
    },

    // ==== Helpers de atribuição (assign/replace/remove) ====

    async assignRoles(userUuid: string, roleUuids: string[], programActivityUuid?: string) {
      this.error = null
      try {
        const dtos = await UserServiceRoleService.assignRoles(userUuid, {
          roleUuids,
          programActivityUuid: programActivityUuid ?? null
        })
        const rows = (dtos ?? []).map((d: any) => UserServiceRole.fromDTO(d))
        // Não mexemos em cache para não bagunçar filtros; força novo fetch se necessário
        return rows
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao atribuir roles'
        console.error(e)
        throw e
      }
    },

    async replaceRoles(userUuid: string, roleUuids: string[], programActivityUuid?: string) {
      this.error = null
      try {
        const dtos = await UserServiceRoleService.replaceRoles(userUuid, {
          roleUuids,
          programActivityUuid: programActivityUuid ?? null
        })
        const rows = (dtos ?? []).map((d: any) => UserServiceRole.fromDTO(d))
        return rows
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao substituir roles'
        console.error(e)
        throw e
      }
    },

    async removeRole(userUuid: string, roleUuid: string, programActivityUuid?: string) {
      this.error = null
      try {
        await UserServiceRoleService.removeRole(userUuid, roleUuid, programActivityUuid)
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao remover role'
        console.error(e)
        throw e
      }
    }
  }
})
