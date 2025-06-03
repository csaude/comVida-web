import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'
import { CohortMember } from '../cohort/CohortMember' // Ajuste o caminho conforme necessário
// import { UserServiceRole } from '../User/UserServiceRole';
import { User } from '../user/User'

@Entity('allocations')
export class Allocation extends BaseEntity {
  @ManyToOne(() => CohortMember)
  @JoinColumn({ name: 'cohort_member_id' })
  cohortMember!: CohortMember

  //   @ManyToOne(() => UserServiceRole)
  //   @JoinColumn({ name: 'user_service_role_id' })
  //   userServiceRole!: UserServiceRole;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'assigned_by_user_id' })
  assignedBy!: User

  @Column({ type: 'timestamp', name: 'allocation_date', nullable: true })
  allocationDate!: Date | null

  @Column({ type: 'json', nullable: true })
  form!: string | null

  @Column({ type: 'varchar', length: 50 })
  status!: string

  constructor(init?: Partial<Allocation>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Allocation {
    const entity = new Allocation()

    // BaseEntity
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    // Relations
    if (dto.cohortMemberId !== undefined) {
      entity.cohortMember = new CohortMember({ id: dto.cohortMemberId })
    }

    if (dto.assignedById !== undefined) {
      entity.assignedBy = new User({ id: dto.assignedById })
    }

    // Others
    entity.allocationDate = dto.allocationDate
      ? new Date(dto.allocationDate)
      : null
    entity.form = dto.form ?? null
    entity.status = dto.status

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

      cohortMemberId: this.cohortMember?.id,
      assignedById: this.assignedBy?.id,
      allocationDate: this.allocationDate?.toISOString() ?? null,
      form: this.form,
      status: this.status,
    }
  }
}
