import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Program } from '../program/Program'

@Entity('program_activity')
export class ProgramActivity extends BaseEntity {
  @Column('text')
  name!: string

  @ManyToOne(() => Program, { nullable: false })
  @JoinColumn({ name: 'program_id' })
  program!: Program

  constructor(init?: Partial<ProgramActivity>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): ProgramActivity {
    const entity = new ProgramActivity()

    // Campos herdados de BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Campos específicos de ProgramActivity
    entity.name = dto.name
    if (dto.program) {
      entity.program = Program.fromDTO(dto.program)
    }

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      lifeCycleStatus: this.lifeCycleStatus,

      name: this.name,
      program: this.program?.toDTO() ?? null
    }
  }
}
