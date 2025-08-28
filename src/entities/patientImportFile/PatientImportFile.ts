import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { ProgramActivity } from '../programActivity/ProgramActivity'
import { SourceSystem } from '../source/SourceSystem'
import { Group } from '../group/Group'

export enum ImportStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  FAILED = 'FAILED',
}

@Entity('patient_import_files')
export class PatientImportFile extends BaseEntity {
  @Column('text')
  name!: string

  @Column({
    type: 'enum',
    enum: ImportStatus,
    default: ImportStatus.PENDING,
  })
  status!: ImportStatus

  @Column('int', { default: 0 })
  progress!: number

  @Column('text', { nullable: true })
  message!: string | null

  @ManyToOne(() => ProgramActivity, { nullable: false })
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group!: Group

  @ManyToOne(() => SourceSystem, { nullable: false })
  @JoinColumn({ name: 'source_system_id' })
  sourceSystem!: SourceSystem

  constructor(init?: Partial<PatientImportFile>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): PatientImportFile {
    const entity = new PatientImportFile()

    // Campos herdados
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)

    // Campos específicos
    entity.name = dto.name
    entity.status = dto.status
    entity.progress = dto.progress ?? 0
    entity.message = dto.message ?? null

    // Adaptação segura de programActivity
    if (dto.programActivity?.id) {
      entity.programActivity = new ProgramActivity({
        id: dto.programActivity.id,
      })
    }

    // Adaptação segura de group
    if (dto.group?.id) {
      entity.group = new Group({ id: dto.group.id })
    }

    // Adaptação segura de sourceSystem
    if (dto.sourceSystem?.id) {
      entity.sourceSystem = new SourceSystem({ id: dto.sourceSystem.id })
    }

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

      name: this.name,
      status: this.status,
      progress: this.progress,
      message: this.message,

      // Garantia de segurança aqui
      programActivity: this.programActivity?.id
        ? { id: this.programActivity.id }
        : null,

      group: this.group?.id ? { id: this.group.id } : null,

      sourceSystem: this.sourceSystem?.id ? { id: this.sourceSystem.id } : null,
    }
  }
}
