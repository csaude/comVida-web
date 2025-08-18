import { Entity, Column, Unique } from 'typeorm'
import { BaseEntity } from '../../entities/base/BaseEntity' // <- ajusta o path se necessário

@Entity('user_service_role_groups')
@Unique('uk_usr_role_groups_pair', ['userServiceRoleUuid', 'groupUuid'])
export class UserServiceRoleGroup extends BaseEntity {
  @Column('text', { nullable: false })
  userServiceRoleUuid!: string

  @Column('text', { nullable: false })
  groupUuid!: string

  constructor(init?: Partial<UserServiceRoleGroup>) {
    super()
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): UserServiceRoleGroup {
    const entity = new UserServiceRoleGroup()
    entity.updateBaseFieldsFromDTO(dto)
    entity.userServiceRoleUuid = dto.userServiceRoleUuid
    entity.groupUuid = dto.groupUuid

    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      userServiceRoleUuid: this.userServiceRoleUuid,
      groupUuid: this.groupUuid,
    }
  }
}
