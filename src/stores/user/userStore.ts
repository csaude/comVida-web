import { defineStore } from 'pinia'
import UserService from 'src/services/user/userService'
import { User } from 'src/entities/user/User'

export const useUserStore = defineStore('user', {
  state: () => ({
    usersPages: {} as Record<number, User[]>,
    currentPageUsers: [] as User[],
    currentUser: null as User | null,
    isAuthenticated: false,
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

        console.log('Fetched users:', users);
        
        if (!isSearch) {
          this.usersPages[page] = users
        }

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
          if (index !== -1) {
            this.usersPages[page][index] = saved
          } else {
            this.usersPages[page].push(saved)
          }
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
          if (index !== -1) {
            this.usersPages[page][index] = updatedUser
          }
        }

        this.currentPageUsers =
          this.usersPages[this.pagination.currentPage] ?? []

        if (this.currentUser?.uuid === uuid) {
          this.currentUser = updatedUser
        }

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

        this.currentPageUsers =
          this.usersPages[this.pagination.currentPage] ?? []

        if (this.currentUser?.uuid === uuid) {
          this.currentUser = null
        }
      } catch (error: any) {
        const apiMessage =
          error?.response?.data?.message || 'Erro ao apagar usuário'

        this.error = apiMessage
        console.error(error)
        throw error
      }
    }
  }
})
