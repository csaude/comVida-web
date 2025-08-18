import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../../entities/base/BaseEntity' // ajuste o caminho se necessário

@Entity('role')
export class Role extends BaseEntity {
  @Column('text', { nullable: true })
  name!: string | null

  constructor(init?: Partial<Role>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Role {
    const entity = new Role()
    entity.updateBaseFieldsFromDTO(dto)
    entity.name = dto.name ?? null
    return entity
  }

  toDTO(): any {
    return {
      ...this.getBaseDTO(),
      name: this.name,
    }
  }
}
