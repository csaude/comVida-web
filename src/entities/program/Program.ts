import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('program')
export class Program extends BaseEntity {
  @Column('text')
  name!: string

  @Column('text', { nullable: true })
  description!: string | null

  constructor(init?: Partial<Program>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Program {
    const entity = new Program()

    // Campos herdados de BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos do Program
    entity.name = dto.name
    entity.description = dto.description ?? null

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      lifeCycleStatus: this.lifeCycleStatus,

      name: this.name,
      description: this.description?.trim() || null
    }
  }

}
