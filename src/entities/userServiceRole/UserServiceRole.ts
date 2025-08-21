import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('user_service_roles')
export class UserServiceRole extends BaseEntity {
  @Column('text', { nullable: true })
  userUuid!: string | null

  @Column('text', { nullable: true })
  roleUuid!: string | null

  @Column('text', { nullable: true })
  programActivityUuid!: string | null

  @Column('int', { nullable: true })
  programActivityId!: number | null

  @Column('int', { nullable: true })
  programId!: number | null

  /** ⬅️ NEW: uuids de grupos associados a este vínculo */
  groupUuids?: string[] | null

  constructor(init?: Partial<UserServiceRole>) {
    super()
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): UserServiceRole {
    const entity = new UserServiceRole()

    entity.updateBaseFieldsFromDTO(dto)
    entity.userUuid = dto.userUuid ?? null
    entity.roleUuid = dto.roleUuid ?? dto.role?.uuid ?? null
    entity.programActivityUuid = dto.programActivityUuid ?? dto.programActivity?.uuid ?? null
    entity.programActivityId = dto.programActivityId ?? dto.programActivity?.id ?? null
    entity.programId = dto.programId ?? dto.program?.id ?? null

    // ⬇️ NEW: suportar vários formatos vindos do backend
    if (Array.isArray(dto.groupUuids)) {
      entity.groupUuids = Array.from(
        new Set(
          (dto.groupUuids as unknown[])
            .map((v) => String(v ?? '').trim())
            .filter((s): s is string => s.length > 0)
        )
      )

    } else if (Array.isArray(dto.userServiceRoleGroups)) {
      entity.groupUuids = dto.userServiceRoleGroups
        .map((g: any) => g?.uuid ?? g?.groupUuid ?? g?.group?.uuid)
        .filter(Boolean)
        .map(String)
        .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i)
    } else {
      entity.groupUuids = []
    }

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      userUuid: this.userUuid ?? null,
      roleUuid: this.roleUuid ?? null,
      programActivityUuid: this.programActivityUuid ?? null,
      programActivityId: this.programActivityId ?? null,
      programId: this.programId ?? null,
      // ⬇️ NEW: mandar os grupos no formato esperado pelo backend
      groupUuids: Array.from(new Set(this.groupUuids ?? [])).filter(Boolean)
    }
  }
}
