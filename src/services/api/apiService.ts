import axios, {
  AxiosInstance,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';

// Cria a instância Axios com baseURL fixa
const instance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:8097/api',
  responseType: 'json',
  validateStatus(status) {
    return status >= 200 && status < 300;
  },
});

// Função para fazer o logout
function logout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('username');
  localStorage.removeItem('userInfo');
  localStorage.removeItem('tokenExpiration');
  window.location.reload();
}

// Função para reiniciar o temporizador do token (15 minutos)
function fixNextTokenExpirationTime() {
  localStorage.setItem('tokenExpiration', String(Date.now() + 900000));
}

// Interceptor de requisição
instance.interceptors.request.use(
  (request: InternalAxiosRequestConfig) => {
    const userInfo = localStorage.getItem('userInfo');

    // Garante que headers seja uma instância de AxiosHeaders
    if (!request.headers || !(request.headers instanceof AxiosHeaders)) {
      request.headers = new AxiosHeaders();
    }

    // Define o header Accept
    request.headers.set('Accept', 'application/json');

    if (request.url === '/auth/refresh') {
      request.headers.delete('Authorization');
    } else if (userInfo && userInfo !== 'null') {
      const tokenExpiration = localStorage.getItem('tokenExpiration');
      const currentTime = Date.now();

      if (tokenExpiration && currentTime < Number(tokenExpiration)) {
        fixNextTokenExpirationTime();
      } else {
        localStorage.setItem('tokenExpiration', '0');
        logout();
        return Promise.reject(new Error('Sessão expirada'));
      }

      const authToken = localStorage.getItem('access_token');
      if (authToken) {
        request.headers.set('Authorization', `Bearer ${authToken}`);
      }
    } else {
      request.headers.delete('Authorization');
    }

    return request;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta (ex: token expirado)
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('Erro 401: não autorizado. Fazendo logout.');
      logout();
    }
    return Promise.reject(error);
  }
);

export default instance;
