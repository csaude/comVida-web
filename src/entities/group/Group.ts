import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { ProgramActivity } from '../programActivity/ProgramActivity'

@Entity('groups')
export class Group extends BaseEntity {
  @Column('text', { unique: true })
  name!: string

  @Column('text', { nullable: false })
  description!: string | null

  @ManyToOne(() => ProgramActivity, { nullable: false })
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity


  programActivityName?: string
  programName?: string

  constructor(init?: Partial<Group>) {
    super()
    if (init) {
      Object.assign(this, init)

      // Garante que programActivity seja instância de ProgramActivity
      if (init.programActivity && !(init.programActivity instanceof ProgramActivity)) {
        this.programActivity = ProgramActivity.fromDTO(init.programActivity)
      }
    }
  }


  static fromDTO(dto: any): Group {
    const entity = new Group()

    // Campos herdados de BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos de Group
    entity.name = dto.name
    entity.description = dto.description ?? null

    if (dto.programActivity) {
      entity.programActivity = ProgramActivity.fromDTO(dto.programActivity)
    }

    entity.programActivityName = dto.programActivity?.name,
    entity.programName = dto.programActivity?.program?.name

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

      name: this.name,
      description: this.description,
      programActivity: this.programActivity?.toDTO() ?? null,
    }
  }
}
