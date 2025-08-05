import {
  Entity,
  Column,
  TableInheritance,
} from 'typeorm'
import { BaseEntity } from '../base/BaseEntity'

@Entity('person')
@TableInheritance({ column: { type: 'varchar', name: 'type' } }) // Estratégia JOINED
export class Person extends BaseEntity {
  @Column('json', { nullable: true })
  names!: Record<string, any>[] | null

  @Column({ type: 'varchar', length: 10, nullable: true })
  sex!: string | null

  @Column({ type: 'date', nullable: true })
  birthdate!: Date | null

  @Column('json', { nullable: true })
  address!: Record<string, any>[] | null

  @Column('json', { name: 'person_attributes', nullable: true })
  personAttributes!: Record<string, any> | null

  // Dentro da classe Person
  fullName?: string | null
  fullAddress?: string | null

  constructor(init?: Partial<Person>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Person {
    const entity = new Person()

    entity.updateBaseFieldsFromDTO(dto)


    entity.names = dto.names ?? []
    entity.address = dto.address ?? []
    entity.sex = dto.sex ?? null
    entity.birthdate = dto.birthdate ? new Date(dto.birthdate) : null
    entity.personAttributes = dto.personAttributes ?? {}

    // ⬇️ Calcular fullName com segurança
    let fullName: string | null = null
    if (entity.names && entity.names.length > 0) {
      const preferedName = entity.names.find(n => n?.prefered) ?? entity.names[0]
      const firstName = preferedName?.firstName ?? ''
      const lastName = preferedName?.lastName ?? ''
      fullName = `${firstName} ${lastName}`.trim() || null
    }

    // ⬇️ Calcular fullAddress com segurança
    let fullAddress: string | null = null
    if (entity.address && entity.address.length > 0) {
      const preferedAddress = entity.address.find(a => a?.prefered) ?? entity.address[0]
      const addressLine1 = preferedAddress?.addressLine1 ?? ''
      const city = preferedAddress?.city ?? ''
      const district = preferedAddress?.district ?? ''
      const province = preferedAddress?.province ?? ''
      fullAddress = [addressLine1, city, district, province].filter(Boolean).join(', ') || null
    }

    entity.fullName = fullName
    entity.fullAddress = fullAddress

    return entity
  }



  toDTO(): any {
    const preferedName =
      this.names?.find(n => n.prefered) ??
      this.names?.[0] ?? {}

    const preferedAddress =
      this.address?.find(a => a.prefered) ??
      this.address?.[0] ?? {}

    const firstName = preferedName.firstName ?? ''
    const lastName = preferedName.lastName ?? ''

    const addressLine1 = preferedAddress.addressLine1 ?? ''
    const city = preferedAddress.city ?? ''
    const district = preferedAddress.district ?? ''
    const province = preferedAddress.province ?? ''

    return {
      // BaseEntity
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedBy: this.updatedBy ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
      lifeCycleStatus: this.lifeCycleStatus,

      // Prefered Name (flat)
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim(),

      // Prefered Address (flat)
      addressLine1,
      city,
      district,
      province,
      fullAddress: [addressLine1, city, district, province].filter(Boolean).join(', '),

      // Raw JSON arrays
      names: this.names ?? [],
      address: this.address ?? [],
      sex: this.sex,
      birthdate: this.birthdate?.toISOString().substring(0, 10) ?? null,
      personAttributes: this.personAttributes ?? {}
    }
  }
}
