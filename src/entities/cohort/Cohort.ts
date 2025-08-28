import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { ProgramActivity } from '../programActivity/ProgramActivity'
import { Group } from '../group/Group'

@Entity('cohort')
export class Cohort extends BaseEntity {
  @Column('text')
  name!: string

  @Column('text', { nullable: true })
  description!: string | null

  @ManyToOne(() => ProgramActivity, { nullable: false })
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group!: Group

  @Column('timestamp', { nullable: true })
  inclusionDate?: Date

  @Column('timestamp', { nullable: true })
  exclusionDate?: Date

  @Column('timestamp', { nullable: true })
  memberCreatedAt?: Date

  programActivityName?: string

  constructor(init?: Partial<Cohort>) {
    super()
    if (init) {
      Object.assign(this, init)

      if (
        init.programActivity &&
        !(init.programActivity instanceof ProgramActivity)
      ) {
        this.programActivity = ProgramActivity.fromDTO(init.programActivity)
      }

      if (init.group && !(init.group instanceof Group)) {
        this.group = Group.fromDTO(init.group)
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
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    if (dto.inclusionDate !== undefined)
      entity.inclusionDate = new Date(dto.inclusionDate)

    if (dto.exclusionDate !== undefined)
      entity.exclusionDate = new Date(dto.exclusionDate)

    if (dto.memberCreatedAt !== undefined)
      entity.memberCreatedAt = new Date(dto.memberCreatedAt)

    // Specific fields
    entity.name = dto.name
    entity.description = dto.description ?? null

    if (dto.programActivity) {
      entity.programActivity = ProgramActivity.fromDTO(dto.programActivity)
    }

    if (dto.group) {
      entity.group = Group.fromDTO(dto.group)
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
      programActivityName: this.programActivity?.name ?? null,
      group: this.group?.toDTO() ?? null,
    }
  }
}
