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

class UserService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post('/login', credentials)
      const data = response.data as LoginResponse

      console.log('Login bem-sucedido:', data)

      // Salvar token e informações no localStorage
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('token_type', data.token_type)
      localStorage.setItem('tokenExpiration', String(Date.now() + data.expires_in * 1000))

      // Salvar nome de utilizador criptografado
      if (credentials.username) {
        EncryptionManager.setEncryptedLocalItem('username', credentials.username)
      }
      if (credentials.password) {
        EncryptionManager.setEncryptedLocalItem('password', credentials.password)
      }

      // Como não temos um objeto `User` completo, vamos salvar apenas o nome
      EncryptionManager.setEncryptedLocalItem('userInfo', JSON.stringify({ name: data.username }))

      return data
    } catch (error: any) {
      console.error('Erro ao fazer login:', error)
      throw error
    }
  }


  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('tokenExpiration')
  }

  getCurrentUser(): User | null {
    const encrypted = EncryptionManager.getDecryptedLocalItem('userInfo')
    try {
      return encrypted ? JSON.parse(encrypted) as User : null
    } catch (e) {
      return null
    }
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    const expiration = parseInt(localStorage.getItem('tokenExpiration') || '0', 10)
    return !!token && Date.now() < expiration
  }
}

export default new UserService()
