import { Entity, Column } from 'typeorm'
import { Person } from '../../entities/person/Person'

@Entity('user')
export class User extends Person {
  @Column('text', { nullable: true })
  username!: string | null

  @Column('text', { nullable: true })
  password!: string | null

  @Column('text', { nullable: true })
  status!: string | null

  @Column('boolean', { nullable: true })
  shouldResetPassword!: boolean | null

  @Column('text', { nullable: true })
  salt!: string | null

  @Column('jsonb', { nullable: true })
  attributes!: Record<string, any> | null

  constructor(init?: Partial<User>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }

  static override fromDTO(dto: any): User {
    const entity = new User()
    const base = Person.fromDTO(dto)

    Object.assign(entity, base)

    entity.username = dto.username ?? null
    entity.password = dto.password ?? null
    entity.status = dto.status ?? null
    entity.shouldResetPassword = dto.shouldResetPassword ?? null
    entity.salt = dto.salt ?? null
    entity.attributes = dto.attributes ?? null

    return entity
  }

  override toDTO(): any {
    return {
      ...super.toDTO(), // Campos herdados de Person/BaseEntity

      username: this.username,
      password: this.password,
      status: this.status,
      shouldResetPassword: this.shouldResetPassword,
      salt: this.salt,
      attributes: this.attributes,
    }
  }
}
