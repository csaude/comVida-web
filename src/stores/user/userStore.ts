import { defineStore } from 'pinia'
import UserService from 'src/services/user/userService'
import { User } from 'src/entities/user/User'
import { UserServiceRole } from 'src/entities/userServiceRole/UserServiceRole'
import { Role } from 'src/entities/role/Role'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Users
    usersPages: {} as Record<number, User[]>,
    currentPageUsers: [] as User[],
    currentUser: null as User | null,

    // Auth
    isAuthenticated: false,

    // Loading & Error
    loading: false,
    error: null as string | null,

    // Users pagination
    pagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100
    },

    // ===== NEW: UserServiceRole listings (per userUuid) =====
    userServiceRolePagesByUser: {} as Record<string, Record<number, UserServiceRole[]>>,
    currentPageUserServiceRoles: [] as UserServiceRole[],
    userServiceRolePagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100
    },

    // ===== NEW: User Roles listings (per userUuid) =====
    userRolesPagesByUser: {} as Record<string, Record<number, Role[]>>,
    currentPageUserRoles: [] as Role[],
    userRolesPagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100
    }
  }),

  actions: {
    // ======================
    // Auth / Sessão
    // ======================
    async login(username: string, password: string) {
      this.error = null
      try {
        await UserService.login({ username, password })
        this.currentUser = User.fromDTO(UserService.getCurrentUser())
        this.isAuthenticated = true
      } catch (err: any) {
        this.error = 'Credenciais inválidas ou erro de autenticação.'
        this.currentUser = null
        this.isAuthenticated = false
        throw err
      }
    },

    logout() {
      UserService.logout()
      this.currentUser = null
      this.isAuthenticated = false
    },

    restoreSession() {
      const user = UserService.getCurrentUser()
      const authenticated = UserService.isAuthenticated()
      this.currentUser = user ? User.fromDTO(user) : null
      this.isAuthenticated = authenticated
    },

    // ======================
    // Users: listagem/CRUD
    // ======================
    async fetchUsers(
      params: {
        page?: number
        size?: number
        sort?: string
        name?: string
        ignoreCache?: boolean
        [key: string]: any
      } = {}
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.pagination.pageSize
      const name = params.name ?? ''
      const ignoreCache = params.ignoreCache ?? false

      const isSearch = name.trim() !== ''
      const useCache = !ignoreCache && !isSearch

      if (useCache && this.usersPages[page]) {
        this.currentPageUsers = this.usersPages[page]
        this.pagination.currentPage = page
        return
      }

      this.loading = true
      this.error = null

      try {
        const response = await UserService.getAll({ ...params, page, size, name })
        const users = (response.content ?? []).map((dto: any) => User.fromDTO(dto))

        if (!isSearch) this.usersPages[page] = users
        this.currentPageUsers = users

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (error: any) {
        this.error = 'Erro ao buscar usuários'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async getUserDetails(id: number) {
      this.loading = true
      this.error = null
      try {
        const dto = await UserService.getById(id)
        this.currentUser = User.fromDTO(dto)
      } catch (error: any) {
        this.error = 'Erro ao buscar detalhes do usuário'
        console.error(error)
      } finally {
        this.loading = false
      }
    },

    async saveUser(userData: Partial<User>) {
      this.error = null
      try {
        const dtoToSend =
          userData instanceof User ? userData.toDTO() : new User(userData).toDTO()

        const savedDto = dtoToSend.id
          ? await UserService.update(dtoToSend)
          : await UserService.save(dtoToSend)

        const saved = User.fromDTO(savedDto)

        const page = this.pagination.currentPage
        if (this.usersPages[page]) {
          const index = this.usersPages[page].findIndex(u => u.id === saved.id)
          if (index !== -1) this.usersPages[page][index] = saved
          else this.usersPages[page].push(saved)
          this.currentPageUsers = this.usersPages[page]
        }

        this.currentUser = saved
      } catch (error: any) {
        this.error = 'Erro ao salvar usuário'
        console.error(error.response?.data || error.message || error)
        throw error
      }
    },

    async updateUserLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await UserService.updateLifeCycleStatus(uuid, lifeCycleStatus)
        const updatedUser = User.fromDTO(updatedDto)

        for (const page in this.usersPages) {
          const index = this.usersPages[page].findIndex(u => u.uuid === uuid)
          if (index !== -1) this.usersPages[page][index] = updatedUser
        }

        this.currentPageUsers = this.usersPages[this.pagination.currentPage] ?? []
        if (this.currentUser?.uuid === uuid) this.currentUser = updatedUser
        return updatedUser
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do usuário'
        console.error(error)
        throw error
      }
    },

    async deleteUser(uuid: string) {
      this.error = null
      try {
        await UserService.delete(uuid)
        for (const page in this.usersPages) {
          this.usersPages[page] = this.usersPages[page].filter(u => u.uuid !== uuid)
        }
        this.currentPageUsers = this.usersPages[this.pagination.currentPage] ?? []
        if (this.currentUser?.uuid === uuid) this.currentUser = null
      } catch (error: any) {
        const apiMessage = error?.response?.data?.message || 'Erro ao apagar usuário'
        this.error = apiMessage
        console.error(error)
        throw error
      }
    },

    // ==========================================
    // NEW: Roles do utilizador (via UserController)
    // ==========================================

    async fetchUserServiceRoles(
      userUuid: string,
      params: { page?: number; size?: number; sort?: string; ignoreCache?: boolean } = {}
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.userServiceRolePagination.pageSize
      const ignoreCache = params.ignoreCache ?? false

      const pagesForUser = this.userServiceRolePagesByUser[userUuid] ?? {}

      if (!ignoreCache && pagesForUser[page]) {
        this.currentPageUserServiceRoles = pagesForUser[page]
        this.userServiceRolePagination.currentPage = page
        this.userServiceRolePagesByUser[userUuid] = pagesForUser
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await UserService.getUserServiceRoles(userUuid, { ...params, page, size })
        const rows = (response.content ?? []).map((dto: any) => UserServiceRole.fromDTO(dto))

        pagesForUser[page] = rows
        this.userServiceRolePagesByUser[userUuid] = pagesForUser
        this.currentPageUserServiceRoles = rows

        this.userServiceRolePagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (e: any) {
        this.error = 'Erro ao buscar vínculos de roles do utilizador'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    async fetchUserRoles(
      userUuid: string,
      params: { page?: number; size?: number; sort?: string; ignoreCache?: boolean } = {}
    ) {
      const page = params.page ?? 0
      const size = params.size ?? this.userRolesPagination.pageSize
      const ignoreCache = params.ignoreCache ?? false

      const pagesForUser = this.userRolesPagesByUser[userUuid] ?? {}

      if (!ignoreCache && pagesForUser[page]) {
        this.currentPageUserRoles = pagesForUser[page]
        this.userRolesPagination.currentPage = page
        this.userRolesPagesByUser[userUuid] = pagesForUser
        return
      }

      this.loading = true
      this.error = null
      try {
        const response = await UserService.getUserRoles(userUuid, { ...params, page, size })
        const roles = (response.content ?? []).map((dto: any) => Role.fromDTO(dto))

        pagesForUser[page] = roles
        this.userRolesPagesByUser[userUuid] = pagesForUser
        this.currentPageUserRoles = roles

        this.userRolesPagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size
        }
      } catch (e: any) {
        this.error = 'Erro ao buscar roles do utilizador'
        console.error(e)
      } finally {
        this.loading = false
      }
    },

    /** Atribui uma ou mais roles; por padrão faz refresh da página atual de vínculos. */
    async assignRolesToUser(
      userUuid: string,
      roleUuids: string[],
      programActivityUuid?: string | null,
      opts: { refresh?: boolean } = { refresh: true }
    ) {
      this.error = null
      try {
        const data = await UserService.assignRoles(userUuid, { roleUuids, programActivityUuid: programActivityUuid ?? null })
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, { page: this.userServiceRolePagination.currentPage })
          await this.fetchUserRoles(userUuid, { page: this.userRolesPagination.currentPage })
        }
        return data
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao atribuir roles'
        console.error(e)
        throw e
      }
    },

    /** Substitui o conjunto de roles num escopo; por padrão faz refresh. */
    async replaceUserRoles(
      userUuid: string,
      roleUuids: string[],
      programActivityUuid?: string | null,
      opts: { refresh?: boolean } = { refresh: true }
    ) {
      this.error = null
      try {
        const data = await UserService.replaceRoles(userUuid, { roleUuids, programActivityUuid: programActivityUuid ?? null })
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, { page: this.userServiceRolePagination.currentPage })
          await this.fetchUserRoles(userUuid, { page: this.userRolesPagination.currentPage })
        }
        return data
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao substituir roles'
        console.error(e)
        throw e
      }
    },

    /** Remove uma role; por padrão faz refresh. */
    async removeUserRole(
      userUuid: string,
      roleUuid: string,
      programActivityUuid?: string,
      opts: { refresh?: boolean } = { refresh: true }
    ) {
      this.error = null
      try {
        await UserService.removeRole(userUuid, roleUuid, programActivityUuid)
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, { page: this.userServiceRolePagination.currentPage })
          await this.fetchUserRoles(userUuid, { page: this.userRolesPagination.currentPage })
        }
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao remover role'
        console.error(e)
        throw e
      }
    }
  }
})
