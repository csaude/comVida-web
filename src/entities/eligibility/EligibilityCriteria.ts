import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { ProgramActivity } from '../programActivity/ProgramActivity'

@Entity('eligibility_criteria')
export class EligibilityCriteria extends BaseEntity {
  @Column('text')
  criteria!: string

  @Column('text', { nullable: true })
  description!: string | null

  @ManyToOne(() => ProgramActivity, { nullable: false })
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity

  constructor(init?: Partial<EligibilityCriteria>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): EligibilityCriteria {
    const entity = new EligibilityCriteria()

    // BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos
    entity.criteria = dto.criteria
    entity.description = dto.description ?? null

    // Relacionamento
    if (dto.programActivity) {
      entity.programActivity = ProgramActivity.fromDTO(dto.programActivity)
    }

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      lifeCycleStatus: this.lifeCycleStatus,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString(),
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt?.toISOString(),

      criteria: this.criteria,
      description: this.description?.trim() || null,

      programActivity: this.programActivity?.toDTO(),
    }
  }
}
