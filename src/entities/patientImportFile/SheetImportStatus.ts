import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import {
  PatientImportFile,
  ImportStatus,
} from '../patientImportFile/PatientImportFile'

@Entity('sheet_import_statuses')
export class SheetImportStatus extends BaseEntity {
  @Column('text')
  sheetName!: string

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

  @ManyToOne(() => PatientImportFile, { nullable: false })
  @JoinColumn({ name: 'patient_import_file_id' })
  patientImportFile!: PatientImportFile

  constructor(init?: Partial<SheetImportStatus>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): SheetImportStatus {
    const entity = new SheetImportStatus()

    // Campos herdados
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)

    // Campos específicos
    entity.sheetName = dto.sheetName
    entity.status = dto.status
    entity.progress = dto.progress ?? 0
    entity.message = dto.message ?? null

    if (dto.patientImportFile?.id) {
      entity.patientImportFile = new PatientImportFile({
        id: dto.patientImportFile.id,
      })
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

      sheetName: this.sheetName,
      status: this.status,
      progress: this.progress,
      message: this.message,

      patientImportFile: this.patientImportFile?.id
        ? { id: this.patientImportFile.id }
        : null,
    }
  }
}
