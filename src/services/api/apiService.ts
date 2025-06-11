import axios, {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosResponse
} from 'axios'
import { useUserStore } from 'src/stores/user/userStore'

// Cria instância Axios com baseURL fixa
const instance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8097/api',
  responseType: 'json',
  validateStatus(status) {
    return status >= 200 && status < 300
  }
})

// Recalcula validade do token para 15 minutos
function fixNextTokenExpirationTime() {
  localStorage.setItem('tokenExpiration', String(Date.now() + 900000))
}

// Interceptor de requisição
instance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const userInfo = localStorage.getItem('userInfo')

    if (!request.headers || !(request.headers instanceof AxiosHeaders)) {
      request.headers = new AxiosHeaders()
    }

    request.headers.set('Accept', 'application/json')

    if (request.url === '/auth/refresh') {
      request.headers.delete('Authorization')
    } else if (userInfo && userInfo !== 'null') {
      const tokenExpiration = localStorage.getItem('tokenExpiration')
      const currentTime = Date.now()

      if (tokenExpiration && currentTime < Number(tokenExpiration)) {
        fixNextTokenExpirationTime()
      } else {
        localStorage.setItem('tokenExpiration', '0')
        const userStore = useUserStore()
        userStore.logout()
        return Promise.reject(new Error('Sessão expirada'))
      }

      const authToken = localStorage.getItem('access_token')
      if (authToken) {
        request.headers.set('Authorization', `Bearer ${authToken}`)
      }
    } else {
      request.headers.delete('Authorization')
    }

    return request
  },
  (error) => Promise.reject(error)
)

// Interceptor de resposta
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro 401: não autorizado.')
      try {
        const userStore = useUserStore()
        userStore.logout()
        // Evita reload automático — deixa o componente decidir
      } catch (err) {
        console.warn('Não foi possível chamar userStore.logout()', err)
      }
    }
    return Promise.reject(error)
  }
)

export default instance
