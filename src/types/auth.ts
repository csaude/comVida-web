// src/types/auth.ts
export interface RoleLite {
  uuid: string
  code: string
  name: string
}

export interface ProgramLite {
  id?: number
  uuid: string
  name?: string
}

export interface ProgramActivityLite {
  id?: number
  uuid: string
  name?: string
  program?: ProgramLite | null
}

export interface UserServiceRoleGroupLite {
  userServiceRoleGroupUuid?: string
  uuid: string
  name: string
  programActivityId?: number
  programActivityUuid?: string
}

export interface ServiceRole {
  uuid: string
  role: RoleLite | null
  programActivity: ProgramActivityLite | null
  userServiceRoleGroups: UserServiceRoleGroupLite[]
}

export interface GrantGroupLite {
  uuid: string
  name: string
  programActivityId?: number
  programActivityUuid?: string
}

export interface GrantLite {
  roleUuid?: string
  roleName?: string
  programActivityId?: number
  programActivityUuid?: string
  programActivityName?: string
  programId?: number
  programUuid?: string
  programName?: string
  groups?: GrantGroupLite[]
}

export interface AuthAttributes {
  userId: number
  userUuid: string
  userName: string
  userNames?: unknown
  // NOVO
  serviceRoles: ServiceRole[]
  // Legado (se ainda vier)
  grants: GrantLite[]
  groupUuids: string[]
}
