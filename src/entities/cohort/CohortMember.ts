import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Cohort } from './Cohort'
import { Patient } from '../patient/Patient' // ajuste o caminho conforme necessário
import { SourceSystem } from '../source/SourceSystem'
import { Group } from '../group/Group'
import { User } from '../user/User'

@Entity('cohort_members')
export class CohortMember extends BaseEntity {
  @ManyToOne(() => Cohort)
  @JoinColumn({ name: 'cohort_id' })
  cohort!: Cohort

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient

  @ManyToOne(() => Group, { nullable: false })
  @JoinColumn({ name: 'group_id' })
  group!: Group

  @ManyToOne(() => SourceSystem)
  @JoinColumn({ name: 'source_system_id' })
  sourceSystem!: SourceSystem

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedByUser!: User

  @Column('text', { nullable: true })
  originId!: string | null

  @Column('text', { nullable: true })
  sourceType!: string | null

  @Column({ type: 'date', name: 'inclusion_date', nullable: true })
  inclusionDate!: Date | null

  @Column({ type: 'date', name: 'exclusion_date', nullable: true })
  exclusionDate!: Date | null

  constructor(init?: Partial<CohortMember>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): CohortMember {
    const entity = new CohortMember()

    // BaseEntity fields
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus
    if (dto.sourceType !== undefined) entity.sourceType = dto.sourceType

    // Relations
    entity.cohort = dto.cohort ? Cohort.fromDTO(dto.cohort) : (undefined as any)
    entity.patient = dto.patient
      ? Patient.fromDTO(dto.patient)
      : (undefined as any)
    entity.sourceSystem = dto.sourceSystem
      ? SourceSystem.fromDTO(dto.sourceSystem)
      : (undefined as any)
    entity.group = dto.group ? Group.fromDTO(dto.group) : (undefined as any)
    entity.assignedByUser = dto.assignedByUser
      ? User.fromDTO(dto.assignedByUser)
      : (undefined as any)

    // Outros campos
    entity.originId = dto.originId ?? null
    entity.inclusionDate = dto.inclusionDate
      ? new Date(dto.inclusionDate)
      : null
    entity.exclusionDate = dto.exclusionDate
      ? new Date(dto.exclusionDate)
      : null

    console.log('CohortMember entity created:', entity)

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
      sourceType: this.sourceType,

      cohort: this.cohort
        ? { id: this.cohort.id, uuid: this.cohort.uuid }
        : null,
      patient: this.patient
        ? { id: this.patient.id, uuid: this.patient.uuid }
        : null,
      sourceSystem: this.sourceSystem
        ? { id: this.sourceSystem.id, uuid: this.sourceSystem.uuid }
        : null,

      group: this.group ? { id: this.group.id, uuid: this.group.uuid } : null,
      assignedByUser: this.assignedByUser
        ? { id: this.assignedByUser.id, uuid: this.assignedByUser.uuid }
        : null,

      originId: this.originId,
      inclusionDate: this.inclusionDate?.toISOString().split('T')[0] ?? null,
      exclusionDate: this.exclusionDate?.toISOString().split('T')[0] ?? null,
    }
  }
}
