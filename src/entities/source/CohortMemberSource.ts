import { Entity, Column } from 'typeorm'
import { BaseEntity } from '../base/BaseEntity' // Ajuste o caminho conforme sua estrutura

@Entity('source_types')
export class CohortMemberSource extends BaseEntity {
  @Column('text')
  name!: string

  constructor(init?: Partial<CohortMemberSource>) {
    super()
    if (init) {
      Object.assign(this, init)
    }
  }
}
