import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { ProgramActivity } from '../programActivity/ProgramActivity'

@Entity('cohort')
export class Cohort extends BaseEntity {
  @Column('text')
  name!: string

  @Column('text', { nullable: true })
  description!: string | null

  @ManyToOne(() => ProgramActivity, { nullable: false })
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity

  programActivityName?: string

  constructor(init?: Partial<Cohort>) {
    super()
    if (init) {
      Object.assign(this, init)

      if (init.programActivity && !(init.programActivity instanceof ProgramActivity)) {
        this.programActivity = ProgramActivity.fromDTO(init.programActivity)
      }
    }
  }

  static fromDTO(dto: any): Cohort {
    const entity = new Cohort()

    // BaseEntity fields
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined) entity.lifeCycleStatus = dto.lifeCycleStatus

    // Specific fields
    entity.name = dto.name
    entity.description = dto.description ?? null

    if (dto.programActivity) {
      entity.programActivity = ProgramActivity.fromDTO(dto.programActivity)
    }

    entity.programActivityName = dto.programActivity?.name

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      lifeCycleStatus: this.lifeCycleStatus,

      name: this.name,
      description: this.description,
      programActivity: this.programActivity?.toDTO() ?? null,
      programActivityName: this.programActivity?.name ?? null
    }
  }
}
