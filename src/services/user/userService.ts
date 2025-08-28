// src/services/UserService.ts (ou onde está o módulo que você colou)
import api from '../api/apiService'
import EncryptionManager from 'src/utils/EncryptionManager'
import { User } from 'src/entities/user/User'
import { jwtDecode } from 'jwt-decode'
import type { AuthAttributes, ServiceRole } from 'src/types/auth'

interface LoginCredentials { username: string; password: string }
interface LoginResponse { access_token: string; token_type: string; expires_in: number; username: string }

type Decoded = {
  sub?: string; exp?: number; iat?: number
  // A: backend coloca tudo em "attrs"
  attrs?: AuthAttributes
  // B: backend espalha no topo
  userId?: number; userUuid?: string; userName?: string; userNames?: string
  grants?: AuthAttributes['grants']
  groupUuids?: string[]
  serviceRoles?: ServiceRole[] // <- caso raro em que venha no topo
}

function readToken(): string | null {
  return localStorage.getItem('access_token')
}

function normalizeAttrs(partial: Partial<AuthAttributes> | null): AuthAttributes | null {
  if (!partial) return null
  const userId = partial.userId ?? (null as any)
  const userUuid = partial.userUuid ?? ''
  const userName = partial.userName ?? ''
  if (userId == null || !userUuid || !userName) return null

  return {
    userId,
    userUuid,
    userName,
    userNames: partial.userNames ?? undefined,
    serviceRoles: partial.serviceRoles ?? [],
    grants: partial.grants ?? [],
    groupUuids: partial.groupUuids ?? []
  }
}

function extractAttrsFromDecoded(decoded: Decoded): AuthAttributes | null {
  // preferir payload em attrs
  if (decoded?.attrs) return normalizeAttrs(decoded.attrs)

  // fallback se vierem claims no topo
  if (decoded?.userId != null && decoded?.userUuid && decoded?.userName) {
    return normalizeAttrs({
      userId: decoded.userId,
      userUuid: decoded.userUuid,
      userName: decoded.userName,
      userNames: decoded.userNames,
      grants: decoded.grants ?? [],
      groupUuids: decoded.groupUuids ?? [],
      serviceRoles: decoded.serviceRoles ?? [] // se vier
    })
  }
  return null
}

function saveAttrs(attrs: AuthAttributes | null) {
  if (!attrs) return
  EncryptionManager.setEncryptedLocalItem('auth_attrs', JSON.stringify(attrs))
}

export default {
  /** Decodifica o token atual e devolve os atributos de autorização. */
  parseAuthAttributesFromToken(): AuthAttributes | null {
    const token = readToken()
    if (!token) return null
    try {
      const decoded = jwtDecode<Decoded>(token)
      const attrs = extractAttrsFromDecoded(decoded)
      if (attrs) saveAttrs(attrs)
      return attrs
    } catch {
      return null
    }
  },

  /** Lê os atributos salvos (persistidos) — útil no restore. */
  getSavedAuthAttributes(): AuthAttributes | null {
    const raw = EncryptionManager.getDecryptedLocalItem('auth_attrs')
    if (!raw) return null
    try { return JSON.parse(raw) as AuthAttributes } catch { return null }
  },

  // =====================
  // Auth / Sessão
  // =====================
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post('/login', credentials)
    const data = response.data as LoginResponse

    localStorage.setItem('access_token', data.access_token)
    localStorage.setItem('token_type', data.token_type)
    localStorage.setItem('tokenExpiration', String(Date.now() + data.expires_in * 1000))

    if (credentials.username) EncryptionManager.setEncryptedLocalItem('username', credentials.username)
    if (credentials.password) EncryptionManager.setEncryptedLocalItem('password', credentials.password)
    EncryptionManager.setEncryptedLocalItem('userInfo', JSON.stringify({ name: data.username }))

    // Decodifica e persiste attrs (inclui serviceRoles)
    const attrs = this.parseAuthAttributesFromToken()
    if (!attrs) console.warn('JWT não contém attrs esperados.')

    return data
  },

  logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('tokenExpiration')
    // EncryptionManager.removeEncryptedLocalItem?.('auth_attrs')
  },

  getCurrentUser(): User | null {
    const encrypted = EncryptionManager.getDecryptedLocalItem('userInfo')
    try { return encrypted ? (JSON.parse(encrypted) as User) : null } catch { return null }
  },

  isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token')
    const expiration = parseInt(localStorage.getItem('tokenExpiration') || '0', 10)
    return !!token && Date.now() < expiration
  },

  // =====================
  // Users (CRUD/Listagem)
  // =====================
  async getAll(params: { page?: number; size?: number; sort?: string; name?: string; [key: string]: any } = {}) {
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
      return response.data?.data ?? response.data
    } catch (error: any) {
      console.error('Erro na API ao salvar usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  async update(data: any) {
    try {
      const response = await api.put('/users', data)
      return response.data?.data ?? response.data
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
      const response = await api.put(`/users/${uuid}/status`, { lifeCycleStatus })
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atualizar estado do usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  // ==========================================
  // Vínculos e Roles via UserController (NOVO)
  // ==========================================
  async getUserServiceRoles(userUuid: string, params: { page?: number; size?: number; sort?: string; [key: string]: any } = {}) {
    const response = await api.get(`/users/${userUuid}/service-roles`, { params })
    return response.data
  },

  async getUserRoles(userUuid: string, params: { page?: number; size?: number; sort?: string; [key: string]: any } = {}) {
    const response = await api.get(`/users/${userUuid}/roles`, { params })
    return response.data
  },

  async assignRoles(userUuid: string, payload: { roleUuids: string[]; programActivityUuid?: string | null }) {
    try {
      const response = await api.post(`/users/${userUuid}/roles/assign`, payload)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao atribuir roles ao usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  async replaceRoles(userUuid: string, payload: { roleUuids: string[]; programActivityUuid?: string | null }) {
    try {
      const response = await api.put(`/users/${userUuid}/roles/replace`, payload)
      return response.data.data
    } catch (error: any) {
      console.error('Erro na API ao substituir roles do usuário:', error.response?.data || error.message || error)
      throw error
    }
  },

  async removeRole(userUuid: string, roleUuid: string, programActivityUuid?: string) {
    const config = programActivityUuid ? { params: { programActivityUuid } } : undefined
    await api.delete(`/users/${userUuid}/roles/${roleUuid}`, config)
  },

  async updatePassword(uuid: string, newPassword: string) {
    const response = await api.put(`/users/${uuid}/password`, {
      newPassword
    })
    return response.data
  },

    /**
   * Importação em lote de utilizadores.
   * Espera um array de objetos com os campos do import.
   * Endpoint sugerido: POST /users/import
   *
   * @example payload:
   * [
   *   { name: 'Ana', surname: 'Silva', username: 'ana.silva', integratedSystem: 'OpenMRS', idOnIntegratedSystem: 'U123', email: 'ana@x.org', phone: '82...' }
   * ]
   */
  async import(rows: Array<{
    name: string
    surname: string
    username: string
    integratedSystem?: string | null
    idOnIntegratedSystem?: string | null
    email?: string | null
    phone?: string | null
  }>) {
    try {
      const resp = await api.post('/users/import', rows)
      // alguns backends envelopam em { data }, outros não — mantém padrão simples
      return resp.data?.data ?? resp.data
    } catch (error: any) {
      console.error('Erro na API ao importar utilizadores:', error?.response?.data || error?.message || error)
      throw error
    }
  },

  /**
   * (Opcional) Validação prévia no servidor antes de importar.
   * Útil para detectar duplicados/erros server-side ainda na pré-visualização.
   * Endpoint sugerido: POST /users/import/validate
   *
   * @returns formato livre; exemplo comum:
   * { valid: [...], invalid: [...], errors: [{ row: 3, message: 'username existente' }] }
   */
  async validateImport(rows: Array<{
    name: string
    surname: string
    username: string
    integratedSystem?: string | null
    idOnIntegratedSystem?: string | null
    email?: string | null
    phone?: string | null
  }>) {
    try {
      const resp = await api.post('/users/import/validate', rows)
      return resp.data?.data ?? resp.data
    } catch (error: any) {
      console.error('Erro na API ao validar importação de utilizadores:',
        error?.response?.data || error?.message || error)
      throw error
    }
  }
,

}
