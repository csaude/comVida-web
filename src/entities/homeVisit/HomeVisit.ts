import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { Allocation } from '../allocation/Allocation'
import { CohortMember } from '../cohort/CohortMember'

@Entity('home_visits')
export class HomeVisit extends BaseEntity {
  @ManyToOne(() => Allocation)
  @JoinColumn({ name: 'allocation_id' })
  allocation!: Allocation

  @ManyToOne(() => CohortMember)
  @JoinColumn({ name: 'cohort_member_id' })
  cohortMember!: CohortMember

  @Column({ type: 'int', name: 'visit_number', nullable: true })
  visitNumber!: number | null

  @Column({ type: 'date', name: 'visit_date', nullable: true })
  visitDate!: Date | null

  @Column({ type: 'text', nullable: true })
  result!: string | null

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @Column({ type: 'json', nullable: true })
  form!: string | null

  constructor(init?: Partial<HomeVisit>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): HomeVisit {
    const entity = new HomeVisit()

    // Campos da BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Relacionamentos (espera-se que o DTO tenha os objetos ou ao menos id)
    entity.allocation = dto.allocation
      ? Allocation.fromDTO(dto.allocation)
      : undefined!
    entity.cohortMember = dto.cohortMember
      ? CohortMember.fromDTO(dto.cohortMember)
      : undefined!

    entity.visitNumber = dto.visitNumber ?? null
    entity.visitDate = dto.visitDate ? new Date(dto.visitDate) : null
    entity.result = dto.result ?? null
    entity.notes = dto.notes ?? null
    entity.form = dto.form ?? null

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

      allocation: this.allocation ? this.allocation.toDTO() : null,
      cohortMember: this.cohortMember ? this.cohortMember.toDTO() : null,

      visitNumber: this.visitNumber,
      visitDate: this.visitDate?.toISOString() ?? null,
      result: this.result,
      notes: this.notes,
      form: this.form,
    }
  }
}
