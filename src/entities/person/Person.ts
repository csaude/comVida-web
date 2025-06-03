import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  TableInheritance,
  Index,
} from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('person')
@TableInheritance({ column: { type: 'varchar', name: 'type' } }) // Estratégia JOINED
export class Person extends BaseEntity {
  @Column('json', { nullable: true })
  names!: string | null

  @Column({ type: 'varchar', length: 10, nullable: true })
  sex!: string | null

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null

  @Column('json', { nullable: true })
  address!: string | null

  @Column('json', { name: 'person_attributes', nullable: true })
  personAttributes!: string | null

  constructor(init?: Partial<Person>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  // Método para converter Entity -> DTO
  toDTO() {
    return {
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt ? this.createdAt.toISOString() : null,
      updatedBy: this.updatedBy ?? null,
      updatedAt: this.updatedAt ? this.updatedAt.toISOString() : null,
      lifeCycleStatus: this.lifeCycleStatus,

      names: this.names,
      sex: this.sex,
      birthdate: this.birthdate
        ? this.birthdate.toISOString().substring(0, 10)
        : null,
      address: this.address,
      personAttributes: this.personAttributes,
    }
  }

  // Método estático para criar Entity a partir de DTO
  static fromDTO(dto: any): Person {
    const entity = new Person()
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

    return entity
  }
}
