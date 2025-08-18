import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../entities/base/BaseEntity' // <- ajusta o path se necessário

@Entity('user_service_roles')
export class UserServiceRole extends BaseEntity {
  // Referências por UUID (mantemos simples para trafegar com a API)
  @Column('text', { nullable: false })
  userUuid!: string

  @Column('text', { nullable: false })
  roleUuid!: string

  // Escopo opcional
  @Column('text', { nullable: true })
  programActivityUuid!: string | null

  constructor(init?: Partial<UserServiceRole>) {
    super()
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): UserServiceRole {
    const entity = new UserServiceRole()

    entity.updateBaseFieldsFromDTO(dto)
    entity.userUuid = dto.userUuid
    entity.roleUuid = dto.roleUuid
    entity.programActivityUuid = dto.programActivityUuid ?? null

    return entity
  }

   toDTO(): any {
    return {
      ...this.getBaseDTO(),
      userUuid: this.userUuid,
      roleUuid: this.roleUuid,
      programActivityUuid: this.programActivityUuid,
    }
  }
}
