import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('person') // Map this class to the "patient" table
export class Person {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: true })
  names!: string | null;

  @Column('text', { nullable: true })
  address!: string | null;

  @Column('text', { nullable: true })
  deletionStatus!: string | null;

  @Column('text', { nullable: true })
  gender!: string | null;

  @Column('integer', { nullable: true })
  birthdate!: number | null;

  @Column('integer')
  birthdateEstimated!: number;

  @Column('text', { nullable: true })
  attributes!: string | null;

  constructor(init?: Partial<Person>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
