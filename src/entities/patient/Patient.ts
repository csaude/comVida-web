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
    const base = Person.fromDTO(dto)
    const entity = new Patient()
    Object.assign(entity, base)
    // Campos específicos do Patient
    entity.patientIdentifier = dto.patientIdentifier ?? null
    entity.status = dto.status ?? null

    return entity
  }

  toDTO(): any {
    return {
      ...super.toDTO(), // Campos herdados de Person/BaseEntity

      patientIdentifier: this.patientIdentifier,
      status: this.status,
    }
  }
}
