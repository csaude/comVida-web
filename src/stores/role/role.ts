import { defineStore } from 'pinia'
import RoleService from 'src/services/role/roleService'
import { Role } from 'src/entities/role/Role'

export const useRoleStore = defineStore('role', {
  state: () => ({
    rolesPages: {} as Record<number, Role[]>,
    currentPageRoles: [] as Role[],
    currentRole: null as Role | null,
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
    async fetchRoles(params: {
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

      if (useCache && this.rolesPages[page]) {
        this.currentPageRoles = this.rolesPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await RoleService.getAll({ ...params, page, size, name })
        const roles = (response.content ?? []).map((dto: any) => Role.fromDTO(dto))

        if (!isSearch) this.rolesPages[page] = roles
        this.currentPageRoles = roles

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (e: any) {
        this.error = 'Erro ao buscar roles'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async getRoleDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await RoleService.getById(id)
        this.currentRole = Role.fromDTO(dto)
      } catch (e: any) {
        this.error = 'Erro ao buscar detalhes da role'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async saveRole(data: Partial<Role>) {
      this.error = null
      try {
        const dtoToSend = data instanceof Role ? data.toDTO() : new Role(data).toDTO()
        const savedDto = dtoToSend.id ? await RoleService.update(dtoToSend) : await RoleService.save(dtoToSend)
        const saved = Role.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.rolesPages[page]) {
          const idx = this.rolesPages[page].findIndex(r => r.id === saved.id)
          if (idx !== -1) this.rolesPages[page][idx] = saved
          else this.rolesPages[page].push(saved)
          this.currentPageRoles = this.rolesPages[page]
        }
        this.currentRole = saved
      } catch (e: any) {
        this.error = 'Erro ao salvar role'
        console.error(e)
        throw e
      }
    },

    async updateRoleLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const dto = await RoleService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updated = Role.fromDTO(dto)

        for (const p in this.rolesPages) {
          const idx = this.rolesPages[p].findIndex(r => r.uuid === uuid)
          if (idx !== -1) this.rolesPages[p][idx] = updated
        }
        this.currentPageRoles = this.rolesPages[this.pagination.currentPage] ?? []
        if (this.currentRole?.uuid === uuid) this.currentRole = updated

        return updated
      } catch (e: any) {
        this.error = 'Erro ao atualizar status da role'
        console.error(e)
        throw e
      }
    },

    async deleteRole(uuid: string) {
      this.error = null
      try {
        await RoleService.delete(uuid)
        for (const p in this.rolesPages) {
          this.rolesPages[p] = this.rolesPages[p].filter(r => r.uuid !== uuid)
        }
        this.currentPageRoles = this.rolesPages[this.pagination.currentPage] ?? []
        if (this.currentRole?.uuid === uuid) this.currentRole = null
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao apagar role'
        console.error(e)
        throw e
      }
    }
  }
})
