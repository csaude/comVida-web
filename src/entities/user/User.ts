import { Entity, Column } from 'typeorm'
import { Person } from '../../entities/person/Person'
import { UserServiceRole } from 'src/entities/userServiceRole/UserServiceRole'

@Entity('user')
export class User extends Person {
  @Column('text', { nullable: true })  username!: string | null
  @Column('text', { nullable: true })  password!: string | null
  @Column('text', { nullable: true })  status!: string | null
  @Column('boolean', { nullable: true }) shouldResetPassword!: boolean | null
  @Column('text', { nullable: true })  salt!: string | null

  // DB stores as JSONB array (or object sometimes) — we normalize to array
  @Column('jsonb', { nullable: true })
  attributes!: Record<string, any>[] | Record<string, any> | null

  // Optional convenience columns for UI/reporting
  @Column('int', { nullable: true })    integratedSystem!: number | null
  @Column('text', { nullable: true })   idOnIntegratedSystem!: string | null
  @Column('text', { nullable: true })   integratedSystemName!: string | null   // ⬅️ NEW

  userServiceRoles?: UserServiceRole[] | null

  constructor(init?: Partial<User>) {
    super()
    if (init) {
      Object.assign(this, init)
      if (Array.isArray(init.userServiceRoles)) {
        this.userServiceRoles = init.userServiceRoles.map((r: any) =>
          r instanceof UserServiceRole ? r : new UserServiceRole(r)
        )
      }
    }
  }

  /* ------------ helpers ------------ */
  private static toNum(v: any): number | null {
    const n = Number(v); return Number.isFinite(n) ? n : null
  }
  private static toStr(v: any): string | null {
    if (v == null) return null
    const s = String(v).trim()
    return s ? s : null
  }
  private static normalizeAttributes(input: any): any[] {
    try {
      if (Array.isArray(input)) return [...input]
      if (input && typeof input === 'string') {
        const parsed = JSON.parse(input)
        return Array.isArray(parsed) ? parsed : (parsed && typeof parsed === 'object' ? [parsed] : [])
      }
      return (input && typeof input === 'object') ? [input] : []
    } catch { return [] }
  }
  private static findIntegratedEntry(attrs: any[]): any | null {
    return attrs.find(o => (o?.type ?? '').toLowerCase() === 'integratedsystem') ?? null
  }

  // Optional mapping if you want an integer code alongside the name.
  // Extend as needed, or remove entirely if you don't use the int column.
  private static NAME_TO_ID: Record<string, number> = {
    DHIS2: 1,
    OpenMRS: 2,
    OpenSRP: 3
  }
  private static nameToId(name?: string | null): number | null {
    if (!name) return null
    return this.NAME_TO_ID[name] ?? null
  }

  /* ------------ mapping ------------ */
  static override fromDTO(dto: any): User {
    const entity = new User()
    const base = Person.fromDTO(dto)
    Object.assign(entity, base)

    entity.username = dto.username ?? null
    entity.password = dto.password ?? null
    entity.status = dto.status ?? null
    entity.shouldResetPassword = dto.shouldResetPassword ?? null
    entity.salt = dto.salt ?? null

    // normalize attributes and read integrated fields from it
    const attrsArr = User.normalizeAttributes(dto.attributes)
    entity.attributes = attrsArr

    const ix = User.findIntegratedEntry(attrsArr)
    const nameFromAttrs = User.toStr(ix?.integratedSystemName)
    const idOnFromAttrs = User.toStr(ix?.idOnIntegratedSystem)

    // Prefer top-level if provided; otherwise fallback to attributes
    entity.integratedSystemName = User.toStr(dto.integratedSystemName) ?? nameFromAttrs
    entity.idOnIntegratedSystem = User.toStr(dto.idOnIntegratedSystem) ?? idOnFromAttrs

    // If you keep the numeric column:
    entity.integratedSystem =
      User.toNum(dto.integratedSystem) ?? User.nameToId(entity.integratedSystemName)

    entity.lifeCycleStatus = dto.status ?? entity.lifeCycleStatus ?? 'ACTIVE'

    entity.userServiceRoles = Array.isArray(dto.userServiceRoles)
      ? dto.userServiceRoles.map((r: any) => UserServiceRole.fromDTO(r))
      : []

    return entity
  }

  override toDTO(): any {
    const base = super.toDTO() || {}
    base.names = Array.isArray(base.names) ? base.names : []
    base.address = Array.isArray(base.address) ? base.address : []
    base.personAttributes = Array.isArray(base.personAttributes) ? base.personAttributes : []

    // --- ensure attributes array and upsert integrated entry
    const attrs: any[] = Array.isArray(this.attributes)
      ? [...this.attributes]
      : User.normalizeAttributes(this.attributes)

    const idx = attrs.findIndex(o => (o?.type ?? '').toLowerCase() === 'integratedsystem')
    const entry = {
      type: 'integratedSystem',
      ...(this.idOnIntegratedSystem ? { idOnIntegratedSystem: this.idOnIntegratedSystem } : {}),
      ...(this.integratedSystemName ? { integratedSystemName: this.integratedSystemName } : {})
    }
    if (idx >= 0) attrs[idx] = { ...attrs[idx], ...entry }
    else attrs.push(entry)

    // ---- roles dto (unchanged – keep your previous logic if needed) ----
    const rolesDto =
      Array.isArray(this.userServiceRoles)
        ? this.userServiceRoles
            .map((r: any) => {
              const programId =
                r.programId ?? r.program?.id ?? r.programIdNumber ?? null
              const programActivityId =
                r.programActivityId ?? r.programActivity?.id ?? r.serviceId ?? null
              const roleUuid =
                r.roleUuid ?? r.role?.uuid ?? r.roleId ?? r.role ?? null
              const groupUuids =
                Array.isArray(r.groupUuids)
                  ? [...new Set(r.groupUuids)]
                  : Array.isArray(r.groups)
                    ? [...new Set(r.groups.map((g: any) => g?.uuid ?? g).filter(Boolean))]
                    : []
              const lifeCycleStatus = r.lifeCycleStatus ?? r.status ?? 'ACTIVE'
              return {
                ...(programId != null ? { programId: Number(programId) } : {}),
                ...(programActivityId != null ? { programActivityId: Number(programActivityId) } : {}),
                ...(roleUuid ? { roleUuid: String(roleUuid) } : {}),
                groupUuids,
                lifeCycleStatus
              }
            })
            .filter(it => it.programId != null && it.programActivityId != null && !!it.roleUuid)
        : []

    const dto: any = {
      ...base,
      username: this.username ?? null,
      status: this.status ?? 'ACTIVE',
      shouldResetPassword: this.shouldResetPassword ?? false,
      salt: this.salt ?? null,

      // expose both convenience fields and attributes
      integratedSystem: this.integratedSystem ?? null,
      integratedSystemName: this.integratedSystemName ?? null,
      idOnIntegratedSystem: this.idOnIntegratedSystem ?? null,

      attributes: attrs,
      userServiceRoles: rolesDto
    }

    if (this.password && String(this.password).trim().length > 0) {
      dto.password = this.password
    }

    return dto
  }
}
