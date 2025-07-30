import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('source_system')
export class SourceSystem extends BaseEntity {
  @Column('text')
  code!: string

  @Column('text')
  description!: string

  @Column('text', { nullable: true })
  originId?: string | null

  constructor(init?: Partial<SourceSystem>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): SourceSystem {
    const entity = new SourceSystem()

    // Campos herdados
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos
    entity.code = dto.code
    entity.description = dto.description
    entity.originId = dto.originId ?? null

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      lifeCycleStatus: this.lifeCycleStatus,

      code: this.code,
      description: this.description,
      originId: this.originId?.trim() || null,
    }
  }
}
