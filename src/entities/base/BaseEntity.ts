import { Column, PrimaryColumn } from 'typeorm'

export abstract class BaseEntity {
  @PrimaryColumn('int')
  id!: number

  @Column('text', { unique: true })
  uuid!: string

  @Column('text')
  createdBy!: string

  @Column('timestamp')
  createdAt!: Date

  @Column('text', { nullable: true })
  updatedBy?: string

  @Column('timestamp', { nullable: true })
  updatedAt?: Date

  @Column('text')
  lifeCycleStatus!: string
}
