import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity' // Ajuste o caminho conforme sua estrutura

@Entity('concepts')
export class Concept extends BaseEntity {
  @Column({ type: 'date', name: 'date_created' })
  dateCreated!: Date

  @Column({ type: 'jsonb' })
  form!: any

  constructor(init?: Partial<Concept>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Concept {
    const entity = new Concept()

    // Campos da BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos
    entity.dateCreated = dto.dateCreated
      ? new Date(dto.dateCreated)
      : new Date()
    entity.form = dto.form ?? null

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedBy: this.updatedBy ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
      lifeCycleStatus: this.lifeCycleStatus,

      dateCreated: this.dateCreated?.toISOString().split('T')[0] ?? null, // só a data
      form: this.form,
    }
  }
}
