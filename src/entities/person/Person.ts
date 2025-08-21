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

  // Se o seu backend passou a enviar personAttributes como array, pode trocar para Record<string, any>[] | null
  @Column('json', { name: 'person_attributes', nullable: true })
  personAttributes!: Record<string, any> | Record<string, any>[] | null

  // Campos derivados/expostos
  fullName?: string | null
  fullAddress?: string | null
  firstName?: string | null
  lastName?: string | null

  constructor(init?: Partial<Person>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static fromDTO(dto: any): Person {
    const entity = new Person()

    entity.updateBaseFieldsFromDTO(dto)

    // Arrays vindos da API (normalizados para array)
    entity.names = Array.isArray(dto.names) ? dto.names : (dto.names ? [dto.names] : [])
    entity.address = Array.isArray(dto.address) ? dto.address : (dto.address ? [dto.address] : [])
    entity.sex = dto.sex ?? null
    entity.birthdate = dto.birthdate ? new Date(dto.birthdate) : null
    entity.personAttributes = Array.isArray(dto.personAttributes)
      ? dto.personAttributes
      : (dto.personAttributes ? [dto.personAttributes] : [])

    // 👉 prefered name (ou primeiro da lista)
    const prefered = entity.names && entity.names.length
      ? (entity.names.find((n: any) => n?.prefered) ?? entity.names[0])
      : null

    entity.firstName = ((prefered?.firstName ?? '') as string).trim() || null
    entity.lastName  = ((prefered?.lastName  ?? '') as string).trim() || null

    // 👇 Fonte da verdade: API `fullName`; senão, montar de first+last (fallback para helper)
    if (dto.fullName && String(dto.fullName).trim().length > 0) {
      entity.fullName = String(dto.fullName).trim()
    } else {
      const built = [entity.firstName ?? '', entity.lastName ?? ''].filter(Boolean).join(' ').trim()
      entity.fullName = built || Person.buildFullNameFromNames(entity.names)
    }

    // ⬇️ fullAddress como antes
    entity.fullAddress = Person.buildFullAddressFromAddress(entity.address)

    return entity
  }


  toDTO(): any {
    const preferedName =
      this.names?.find((n: any) => n?.prefered) ??
      this.names?.[0] ?? {}

    const preferedAddress =
      this.address?.find((a: any) => a?.prefered) ??
      this.address?.[0] ?? {}

    const firstName = preferedName.firstName ?? ''
    const lastName = preferedName.lastName ?? ''

    const addressLine1 = preferedAddress.addressLine1 ?? ''
    const city = preferedAddress.city ?? ''
    const district = preferedAddress.district ?? ''
    const province = preferedAddress.province ?? ''

    // guarantees arrays
    const asArray = (v: any, fallback: any[] = []) =>
      Array.isArray(v) ? v : (v ? [v] : fallback)

    return {
      // BaseEntity
      id: this.id,
      uuid: this.uuid,
      createdBy: this.createdBy,
      createdAt: this.createdAt?.toISOString() ?? null,
      updatedBy: this.updatedBy ?? null,
      updatedAt: this.updatedAt?.toISOString() ?? null,
      lifeCycleStatus: this.lifeCycleStatus,

      // Preferred Name (flat de conveniência)
      firstName,
      lastName,

      // 👇 Exporta o que está na entidade (que veio da API), com fallback
      fullName: this.fullName ?? Person.buildFullNameFromNames(this.names),

      // Preferred Address (flat)
      addressLine1,
      city,
      district,
      province,
      fullAddress: Person.buildFullAddressFromAddress(this.address) ?? '',

      // JSON arrays (ensure arrays)
      names: asArray(this.names, []),
      address: asArray(this.address, []),
      personAttributes: asArray(this.personAttributes, []),

      // Other person fields
      sex: this.sex,
      birthdate: this.birthdate
        ? new Date(this.birthdate).toISOString().slice(0, 10)
        : null
    }
  }

  /* ===================== Helpers ===================== */

  private static buildFullNameFromNames(names?: Record<string, any>[] | null): string | null {
    if (!names || names.length === 0) return null
    const prefered = names.find(n => n?.prefered) ?? names[0]
    const firstName = (prefered?.firstName ?? '').trim()
    const lastName = (prefered?.lastName ?? '').trim()
    const out = `${firstName} ${lastName}`.trim()
    return out.length ? out : null
  }

  private static buildFullAddressFromAddress(address?: Record<string, any>[] | null): string | null {
    if (!address || address.length === 0) return null
    const prefered = address.find(a => a?.prefered) ?? address[0]
    const addressLine1 = (prefered?.addressLine1 ?? '').trim()
    const city = (prefered?.city ?? '').trim()
    const district = (prefered?.district ?? '').trim()
    const province = (prefered?.province ?? '').trim()
    const parts = [addressLine1, city, district, province].filter(Boolean)
    const out = parts.join(', ')
    return out.length ? out : null
  }
}
