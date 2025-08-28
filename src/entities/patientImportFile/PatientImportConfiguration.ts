import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Cohort } from '../cohort/Cohort'
import { PatientImportFile } from './PatientImportFile'
import { ProgramActivity } from '../programActivity/ProgramActivity'

@Entity('patient_import_configurations')
export class PatientImportConfiguration extends BaseEntity {
  @ManyToOne(() => Cohort)
  @JoinColumn({ name: 'cohort_id' })
  cohort!: Cohort

  @ManyToOne(() => PatientImportFile)
  @JoinColumn({ name: 'import_file_id' })
  patientImportFile!: PatientImportFile

  @ManyToOne(() => ProgramActivity)
  @JoinColumn({ name: 'program_activity_id' })
  programActivity!: ProgramActivity | null

  @Column('timestamp')
  entryDate!: Date | null

  @Column('timestamp')
  exitDate!: Date | null

  @Column('text', { nullable: true })
  notes!: string | null

  constructor(init?: Partial<PatientImportConfiguration>) {
    super()
    if (init) Object.assign(this, init)
  }

  static fromDTO(dto: any): PatientImportConfiguration {
    const entity = new PatientImportConfiguration()

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
    entity.entryDate = dto.entryDate ? new Date(dto.entryDate) : null
    entity.exitDate = dto.exitDate ? new Date(dto.exitDate) : null
    entity.notes = dto.notes ?? null

    // Relacionamentos
    if (dto.cohort) entity.cohort = Cohort.fromDTO(dto.cohort)
    if (dto.patientImportFile)
      entity.patientImportFile = PatientImportFile.fromDTO(
        dto.patientImportFile,
      )
    if (dto.programActivity) {
      entity.programActivity = ProgramActivity.fromDTO(dto.programActivity)
    } else {
      entity.programActivity = null
    }

    return entity
  }

  toDTO(): any {
    return {
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString(),
      updatedBy: this.updatedBy,
      updatedAt: this.updatedAt?.toISOString(),
      lifeCycleStatus: this.lifeCycleStatus,

      entryDate: this.entryDate?.toISOString().split('T')[0] || null,
      exitDate: this.exitDate?.toISOString().split('T')[0] || null,
      notes: this.notes?.trim() || null,

      cohort: this.cohort?.toDTO(),
      patientImportFile: this.patientImportFile?.toDTO(),
      programActivity: this.programActivity?.toDTO() ?? null,
    }
  }
}
