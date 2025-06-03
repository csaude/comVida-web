import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Cohort } from './Cohort'
import { Patient } from '../patient/Patient' // ajuste o caminho conforme necessário
import { CohortMemberSource } from '../source/CohortMemberSource' // ajuste conforme sua estrutura

@Entity('cohort_members')
export class CohortMember extends BaseEntity {
  @ManyToOne(() => Cohort)
  @JoinColumn({ name: 'cohort_id' })
  cohort!: Cohort

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient

  @ManyToOne(() => CohortMemberSource)
  @JoinColumn({ name: 'cohort_member_source_id' })
  sourceType!: CohortMemberSource

  @Column('text', { nullable: true })
  originId!: string | null

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

    // Entity-specific fields
    if (dto.cohort?.id) entity.cohort = new Cohort({ id: dto.cohort.id })
    if (dto.patient?.id) entity.patient = new Patient({ id: dto.patient.id })
    if (dto.sourceType?.id)
      entity.sourceType = new CohortMemberSource({ id: dto.sourceType.id })

    entity.originId = dto.originId ?? null
    entity.inclusionDate = dto.inclusionDate
      ? new Date(dto.inclusionDate)
      : null
    entity.exclusionDate = dto.exclusionDate
      ? new Date(dto.exclusionDate)
      : null

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

      cohort: this.cohort
        ? { id: this.cohort.id, uuid: this.cohort.uuid }
        : null,
      patient: this.patient
        ? { id: this.patient.id, uuid: this.patient.uuid }
        : null,
      sourceType: this.sourceType
        ? { id: this.sourceType.id, uuid: this.sourceType.uuid }
        : null,

      originId: this.originId,
      inclusionDate: this.inclusionDate?.toISOString().split('T')[0] ?? null,
      exclusionDate: this.exclusionDate?.toISOString().split('T')[0] ?? null,
    }
  }
}
