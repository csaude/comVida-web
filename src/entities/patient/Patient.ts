import { Entity, Column } from 'typeorm'
import { Person } from '../person/Person'

@Entity('patients')
export class Patient extends Person {
  @Column('json', { name: 'patient_identifier', nullable: true })
  patientIdentifier!: string | null

  @Column({ type: 'varchar', length: 50, nullable: true })
  status!: string | null

  constructor(init?: Partial<Patient>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Patient {
    const entity = new Patient()

    // Campos da BaseEntity + Person
    if (dto.id !== undefined) entity.id = dto.id
    if (dto.uuid !== undefined) entity.uuid = dto.uuid
    if (dto.createdBy !== undefined) entity.createdBy = dto.createdBy
    if (dto.createdAt !== undefined) entity.createdAt = new Date(dto.createdAt)
    if (dto.updatedBy !== undefined) entity.updatedBy = dto.updatedBy
    if (dto.updatedAt !== undefined) entity.updatedAt = new Date(dto.updatedAt)
    if (dto.lifeCycleStatus !== undefined)
      entity.lifeCycleStatus = dto.lifeCycleStatus

    entity.names = dto.names ?? null
    entity.sex = dto.sex ?? null
    entity.birthdate = dto.birthdate ? new Date(dto.birthdate) : null
    entity.address = dto.address ?? null
    entity.personAttributes = dto.personAttributes ?? null

    // Campos específicos do Patient
    entity.patientIdentifier = dto.patientIdentifier ?? null
    entity.status = dto.status ?? null

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

      names: this.names,
      sex: this.sex,
      birthdate: this.birthdate?.toISOString() ?? null,
      address: this.address,
      personAttributes: this.personAttributes,

      patientIdentifier: this.patientIdentifier,
      status: this.status,
    }
  }
}
