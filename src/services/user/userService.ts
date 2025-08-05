import api from '../api/apiService'
import EncryptionManager from 'src/utils/EncryptionManager'
import { User } from 'src/entities/user/User'

interface LoginCredentials {
  username: string
  password: string
}

interface LoginResponse {
  access_token: string
  token_type: string
  expires_in: number
  username: string
}

export default {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials)
      const data = response.data as LoginResponse

      console.log('Login bem-sucedido:', data)

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)
      localStorage.setItem('tokenExpiration', String(Date.now() + data.expires_in * 1000))

      if (credentials.username) {
        EncryptionManager.setEncryptedLocalItem('username', credentials.username)
      }

      if (credentials.password) {
        EncryptionManager.setEncryptedLocalItem('password', credentials.password)
      }

      EncryptionManager.setEncryptedLocalItem('userInfo', JSON.stringify({ name: data.username }))

      return data
    } catch (error: any) {
      console.error('Erro ao fazer login:', error.response?.data || error.message || error)
      throw error
    }
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('tokenExpiration')
  },

  getCurrentUser(): User | null {
    const encrypted = EncryptionManager.getDecryptedLocalItem('userInfo')
    try {
      return encrypted ? JSON.parse(encrypted) as User : null
    } catch (e) {
      return null
    }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    const expiration = parseInt(localStorage.getItem('tokenExpiration') || '0', 10)
    return !!token && Date.now() < expiration
  },

  async getAll(
    params: {
      page?: number
      size?: number
      sort?: string
      name?: string
      [key: string]: any
    } = {}
  ) {
    const response = await api.get('/users', { params })
    return response.data
  },

  async getById(id: number) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async save(data: any) {
    try {
      const response = await api.post('/users', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/users', data)
      return response.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  async delete(uuid: string) {
    await api.delete(`/users/${uuid}`)
  },

  async updateLifeCycleStatus(uuid: string, lifeCycleStatus: string) {
    try {
      const response = await api.put(`/users/${uuid}/status`, {
        lifeCycleStatus
      })
      return response.data.data
    } catch (error: any) {
      console.error(
        'Erro na API ao atualizar estado do usuário:',
        error.response?.data || error.message || error
      )
      throw error
    }
  }
}
