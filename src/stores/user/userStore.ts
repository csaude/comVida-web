import { defineStore } from 'pinia'
import UserService from 'src/services/user/userService'
import { User } from 'src/entities/user/User'

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[], // Lista de usuários (se necessário)
    currentUser: null as User | null, // Usuário autenticado
    isAuthenticated: false, // Estado de login
    error: null as string | null
  }),

  actions: {
    async login(username: string, password: string) {
      this.error = null
      try {
        await UserService.login({ username, password })

        this.currentUser = UserService.getCurrentUser() as User
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

      this.currentUser = user
      this.isAuthenticated = authenticated
    }
  }
})
