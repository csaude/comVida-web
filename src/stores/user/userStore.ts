import { defineStore } from 'pinia'
import UserService from 'src/services/user/userService'
import { User } from 'src/entities/user/User'
import { UserServiceRole } from 'src/entities/userServiceRole/UserServiceRole'
import { Role } from 'src/entities/role/Role'
import type { AuthAttributes } from 'src/types/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    // Users
    usersPages: {} as Record<number, User[]>,
    currentPageUsers: [] as User[],
    currentUser: null as User | null,
    volunteerUsers: [] as User[],
    volunteerUsersLoaded: false,

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
      pageSize: 100,
    },

    // ===== NEW: UserServiceRole listings (per userUuid) =====
    userServiceRolePagesByUser: {} as Record<
      string,
      Record<number, UserServiceRole[]>
    >,
    currentPageUserServiceRoles: [] as UserServiceRole[],
    userServiceRolePagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100,
    },

    // ===== NEW: User Roles listings (per userUuid) =====
    userRolesPagesByUser: {} as Record<string, Record<number, Role[]>>,
    currentPageUserRoles: [] as Role[],
    userRolesPagination: {
      totalSize: 0,
      totalPages: 0,
      currentPage: 0,
      pageSize: 100,
    },
    authAttrs: null as AuthAttributes | null,
  }),

  getters: {
    /** Lista de serviceRoles vinda do JWT (novo payload) */
    serviceRoles: (s) => s.authAttrs?.serviceRoles ?? [],

    /** Uuids de grupos (legado), se o backend ainda enviar em nível de topo */
    groupUuids: (s) => s.authAttrs?.groupUuids ?? [],

    /** Grupos agregados a partir dos vínculos (userServiceRoleGroups, novo payload) */
    groupsFromServiceRoles: (s) => {
      const out: {
        uuid: string
        name?: string
        programActivityUuid?: string
        programActivityId?: number
      }[] = []
      for (const sr of s.authAttrs?.serviceRoles ?? []) {
        for (const g of sr.userServiceRoleGroups ?? []) {
          if (!g?.uuid) continue
          if (!out.find((x) => x.uuid === g.uuid)) {
            out.push({
              uuid: g.uuid,
              name: g.name,
              programActivityUuid: g.programActivityUuid,
              programActivityId: g.programActivityId,
            })
          }
        }
      }
      return out
    },

    /** Nomes de roles (compatível com legado e novo) */
    roles: (s) => {
      const legacy = (s.authAttrs?.grants ?? [])
        .map((g) => g.roleName)
        .filter(Boolean) as string[]
      const fromSR = (s.authAttrs?.serviceRoles ?? [])
        .map((sr) => sr.role?.name)
        .filter(Boolean) as string[]
      return Array.from(new Set([...legacy, ...fromSR]))
    },

    /** Verifica role por NOME **ou** CÓDIGO (novo), mantendo compatibilidade */
    hasRole: (s) => (roleCodeOrName: string) => {
      const inSR = (s.authAttrs?.serviceRoles ?? []).some(
        (sr) =>
          sr.role?.code === roleCodeOrName || sr.role?.name === roleCodeOrName,
      )
      const inLegacy = (s.authAttrs?.grants ?? []).some(
        (g) => g.roleName === roleCodeOrName,
      )
      return inSR || inLegacy
    },

    /** Verifica se pertence a um grupo (aceita uuid). Considera topo e serviceRoles */
    inGroup(this: any, state) {
      return (uuid: string) => {
        if ((state.authAttrs?.groupUuids ?? []).includes(uuid)) return true
        return this.groupsFromServiceRoles.some(
          (g: { uuid: string }) => g.uuid === uuid,
        )
      }
    },

    /** Acesso por ID de ProgramActivity (compatível: legado + novo) */
    canAccessProgramActivity: (s) => (paId?: number | null) => {
      if (!paId) return true // global
      const legacy = (s.authAttrs?.grants ?? []).some(
        (g) => g.programActivityId === paId,
      )
      const viaSR = (s.authAttrs?.serviceRoles ?? []).some(
        (sr) => sr.programActivity?.id === paId,
      )
      return legacy || viaSR
    },

    /** Acesso por UUID de ProgramActivity (novo) */
    canAccessProgramActivityUuid: (s) => (paUuid?: string | null) => {
      if (!paUuid) return true // global
      const viaSR = (s.authAttrs?.serviceRoles ?? []).some(
        (sr) => sr.programActivity?.uuid === paUuid,
      )
      const legacy = (s.authAttrs?.grants ?? []).some(
        (g) => g.programActivityUuid === paUuid,
      )
      return viaSR || legacy
    },

    /** Verifica role em um PROGRAMA específico (usa role code OU name). Se programUuid for omitido, exige role global (sem programa). */
    hasRoleInProgram:
      (s) => (roleCodeOrName: string, programUuid?: string | null) => {
        return (s.authAttrs?.serviceRoles ?? []).some((sr) => {
          const roleOk =
            sr.role?.code === roleCodeOrName || sr.role?.name === roleCodeOrName
          if (!roleOk) return false
          const pUuid = sr.programActivity?.program?.uuid
          return programUuid ? pUuid === programUuid : !pUuid // se não informar programa, exige global
        })
      },
  },

  actions: {
    // ======================
    // Auth / Sessão
    // ======================
    async login(username: string, password: string) {
      this.error = null
      try {
        await UserService.login({ username, password })

        // 🔑 carrega attrs decodificados do próprio token
        this.authAttrs = UserService.parseAuthAttributesFromToken()

        this.currentUser = User.fromDTO(UserService.getCurrentUser())
        this.isAuthenticated = true
      } catch (err: any) {
        this.error = 'Credenciais inválidas ou erro de autenticação.'
        this.currentUser = null
        this.isAuthenticated = false
        this.authAttrs = null
        throw err
      }
    },

    logout() {
      UserService.logout()
      this.currentUser = null
      this.isAuthenticated = false
      this.authAttrs = null
    },

    restoreSession() {
      const user = UserService.getCurrentUser()
      const authenticated = UserService.isAuthenticated()
      this.currentUser = user ? User.fromDTO(user) : null
      this.isAuthenticated = authenticated

      // 🔁 tenta restaurar attrs persistidos (ou re-decodifica do token)
      this.authAttrs =
        UserService.getSavedAuthAttributes() ||
        UserService.parseAuthAttributesFromToken()
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
      } = {},
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
        const response = await UserService.getAll({
          ...params,
          page,
          size,
          name,
        })
        console.log('Fetched users:', response)
        const users = (response.content ?? []).map((dto: any) =>
          User.fromDTO(dto),
        )

        if (!isSearch) this.usersPages[page] = users
        this.currentPageUsers = users

        this.pagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
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
        // 1) Monta dto e detecta se é criação
        const dtoToSend =
          userData instanceof User
            ? userData.toDTO()
            : new User(userData).toDTO()
        const isNew = !dtoToSend.id

        console.log('Saving user data:', dtoToSend)

        // 2) Chama API e desembrulha payload (SuccessResponse { data })
        const apiResp = isNew
          ? await UserService.save(dtoToSend)
          : await UserService.update(dtoToSend)

        const savedDto = apiResp?.data ?? apiResp
        console.log('User saved (raw):', savedDto)

        // 3) Mapeia para entidade
        const saved = User.fromDTO(savedDto)
        console.log('User entity created:', saved)

        // 4) Helpers reativos
        const replaceOrInsert = (arr?: User[]) => {
          if (!Array.isArray(arr)) return false
          const idx = arr.findIndex((u) => u?.uuid === saved.uuid)
          if (idx >= 0) {
            arr.splice(idx, 1, saved) // garante reatividade
            return false // já existia (edição)
          } else {
            arr.unshift(saved) // novo registro entra no topo
            return true // inseriu novo
          }
        }

        // 5) Atualiza TODAS as páginas cacheadas
        let insertedSomewhere = false
        for (const key of Object.keys(this.usersPages)) {
          insertedSomewhere =
            replaceOrInsert(this.usersPages[key]) || insertedSomewhere
        }

        // 6) Atualiza SEMPRE a página atual na UI
        insertedSomewhere =
          replaceOrInsert(this.currentPageUsers) || insertedSomewhere
        // força reatividade de quem observa o array
        this.currentPageUsers = [...this.currentPageUsers]

        // 7) Ajusta paginação se foi criação e inserimos na lista
        if (isNew && insertedSomewhere) {
          this.pagination.totalSize += 1
          this.pagination.totalPages = Math.ceil(
            this.pagination.totalSize / this.pagination.pageSize,
          )
        }

        // 8) Seleção atual
        this.currentUser = saved
        return saved
      } catch (error: any) {
        this.error = 'Erro ao salvar usuário'
        console.error(error.response?.data || error.message || error)
        throw error
      }
    },
    async updateUserLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
      this.error = null
      try {
        const updatedDto = await UserService.updateLifeCycleStatus(
          uuid,
          lifeCycleStatus,
        )
        const updatedUser = User.fromDTO(updatedDto)

        for (const page in this.usersPages) {
          const index = this.usersPages[page].findIndex((u) => u.uuid === uuid)
          if (index !== -1) this.usersPages[page][index] = updatedUser
        }

        this.currentPageUsers =
          this.usersPages[this.pagination.currentPage] ?? []
        if (this.currentUser?.uuid === uuid) this.currentUser = updatedUser
        return updatedUser
      } catch (error: any) {
        this.error = 'Erro ao atualizar status do usuário'
        console.error(error)
        throw error
      }
    },

    async deleteUser(uuid: string, opts: { name?: string } = {}) {
      this.error = null
      try {
        await UserService.delete(uuid)

        // 1) Remove dos caches e da página atual
        let removedSomewhere = false
        for (const pageKey of Object.keys(this.usersPages)) {
          const before = this.usersPages[pageKey].length
          this.usersPages[pageKey] = this.usersPages[pageKey].filter(
            (u) => u.uuid !== uuid,
          )
          if (this.usersPages[pageKey].length !== before)
            removedSomewhere = true
        }

        // Reaponta a página atual para o cache se existir; senão, filtra localmente
        const cached = this.usersPages[this.pagination.currentPage]
        this.currentPageUsers = cached
          ? cached
          : this.currentPageUsers.filter((u) => u.uuid !== uuid)

        if (this.currentUser?.uuid === uuid) this.currentUser = null

        // 2) Atualiza a paginação local (sabemos que apagou no servidor)
        this.pagination.totalSize = Math.max(
          0,
          (this.pagination.totalSize || 0) - 1,
        )
        this.pagination.totalPages =
          this.pagination.pageSize > 0
            ? Math.ceil(this.pagination.totalSize / this.pagination.pageSize)
            : 0

        // 3) Se a página atual ficou inválida (ex.: caiu de 3 para 2), recua
        if (
          this.pagination.currentPage >= this.pagination.totalPages &&
          this.pagination.totalPages > 0
        ) {
          this.pagination.currentPage = this.pagination.totalPages - 1
        }

        // 4) Se a página atual está vazia, tenta recuar uma página
        if (
          this.currentPageUsers.length === 0 &&
          this.pagination.currentPage > 0
        ) {
          this.pagination.currentPage -= 1
        }

        // 5) Refresh do servidor para garantir consistência
        await this.fetchUsers({
          page: this.pagination.currentPage,
          size: this.pagination.pageSize,
          name: opts.name ?? '',
          ignoreCache: true,
        })
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar usuário'
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
      params: {
        page?: number
        size?: number
        sort?: string
        ignoreCache?: boolean
      } = {},
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
        const response = await UserService.getUserServiceRoles(userUuid, {
          ...params,
          page,
          size,
        })
        const rows = (response.content ?? []).map((dto: any) =>
          UserServiceRole.fromDTO(dto),
        )

        pagesForUser[page] = rows
        this.userServiceRolePagesByUser[userUuid] = pagesForUser
        this.currentPageUserServiceRoles = rows

        this.userServiceRolePagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
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
      params: {
        page?: number
        size?: number
        sort?: string
        ignoreCache?: boolean
      } = {},
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
        const response = await UserService.getUserRoles(userUuid, {
          ...params,
          page,
          size,
        })
        const roles = (response.content ?? []).map((dto: any) =>
          Role.fromDTO(dto),
        )

        pagesForUser[page] = roles
        this.userRolesPagesByUser[userUuid] = pagesForUser
        this.currentPageUserRoles = roles

        this.userRolesPagination = {
          totalSize: response.total,
          totalPages: Math.ceil(response.total / size),
          currentPage: response.page,
          pageSize: response.size,
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
      opts: { refresh?: boolean } = { refresh: true },
    ) {
      this.error = null
      try {
        const data = await UserService.assignRoles(userUuid, {
          roleUuids,
          programActivityUuid: programActivityUuid ?? null,
        })
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, {
            page: this.userServiceRolePagination.currentPage,
          })
          await this.fetchUserRoles(userUuid, {
            page: this.userRolesPagination.currentPage,
          })
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
      opts: { refresh?: boolean } = { refresh: true },
    ) {
      this.error = null
      try {
        const data = await UserService.replaceRoles(userUuid, {
          roleUuids,
          programActivityUuid: programActivityUuid ?? null,
        })
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, {
            page: this.userServiceRolePagination.currentPage,
          })
          await this.fetchUserRoles(userUuid, {
            page: this.userRolesPagination.currentPage,
          })
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
      opts: { refresh?: boolean } = { refresh: true },
    ) {
      this.error = null
      try {
        await UserService.removeRole(userUuid, roleUuid, programActivityUuid)
        if (opts.refresh) {
          await this.fetchUserServiceRoles(userUuid, {
            page: this.userServiceRolePagination.currentPage,
          })
          await this.fetchUserRoles(userUuid, {
            page: this.userRolesPagination.currentPage,
          })
        }
      } catch (e: any) {
        this.error = e?.response?.data?.message || 'Erro ao remover role'
        console.error(e)
        throw e
      }
    },

    async updateUserPassword(uuid: string, newPassword: string) {
      this.error = null
      try {
        await UserService.updatePassword(uuid, newPassword)
      } catch (error: any) {
        this.error = 'Erro ao atualizar senha do utilizador'
        console.error(error)
        throw error
      }
    },

    async validateImport(
      rows: ImportRowPayload[],
    ): Promise<ValidateImportResult> {
      // Nota: não uso this.loading para não interferir na tabela principal
      this.error = null
      try {
        const result = await UserService.validateImport(rows)
        // O service já faz: resp.data?.data ?? resp.data
        // Garantimos a forma { errors: [...] }
        const out = (result ?? {}) as ValidateImportResult
        if (!out.errors) return { errors: [] }
        return out
      } catch (e: any) {
        this.error =
          e?.response?.data?.message ||
          'Erro ao validar importação de utilizadores'
        console.error('validateImport error:', e)
        throw e
      }
    },
    /**
     * Importa utilizadores em lote.
     * Espera um array de objetos com os campos do import.
     * Após importar, limpa o cache e atualiza a primeira página.
     */
    async importUsersBulk(
      rows: Array<{
        name: string
        surname: string
        username: string
        integratedSystem?: string | null
        idOnIntegratedSystem?: string | null
        email?: string | null
        phone?: string | null
      }>,
    ) {
      this.error = null
      this.loading = true
      try {
        const res = await UserService.import(rows) // POST /users/import (ajusta no service se necessário)
        // Limpa caches e atualiza a listagem
        this.usersPages = {}
        await this.fetchUsers({
          page: 0,
          size: this.pagination.pageSize,
          ignoreCache: true,
        })
        return res
      } catch (e: any) {
        this.error =
          e?.response?.data?.message || 'Erro ao importar utilizadores'
        console.error(e)
        throw e
      } finally {
        this.loading = false
      }
    },

    async fetchFocalPointUsers(forceReload = false) {
      // Se já carregamos e não for um reload, retorna cache
      if (this.volunteerUsersLoaded && !forceReload) {
        return this.volunteerUsers
      }

      this.loading = true
      this.error = null
      try {
        const response = await UserService.getFocalPointUsers()
        const users = (response.data ?? []).map((dto: any) => User.fromDTO(dto))

        this.volunteerUsers = users
        this.volunteerUsersLoaded = true
        return users
      } catch (error: any) {
        this.error = 'Erro ao buscar Focal Points'
        console.error(error)
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
