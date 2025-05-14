import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('patient')
export class Patient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: true })
  identifiers!: string | null;

  @Column('text', { nullable: true })
  tags!: string | null;

  @Column('boolean', { nullable: true })
  deletionStatus!: boolean | null;

  @Column('integer')
  personId!: number;

  @Index()
  @Column('text', { nullable: true })
  personUuid!: string | null;

  @Column('text', { nullable: true })
  gender!: string | null;

  @Column('date', { nullable: true })
  birthdate!: Date | null;

  @Column('boolean')
  birthdateEstimated!: boolean;

  @Column('text', { nullable: true })
  names!: string | null;

  @Column('text', { nullable: true })
  attributes!: string | null;

  @Column('text', { nullable: true })
  addresses!: string | null;

  @Column('boolean')
  voided!: boolean;

  @Column('text', { nullable: true })
  personTags!: string | null;

  @Column('text', { nullable: true })
  uri!: string | null;

  @Index()
  @Column('text')
  uuid!: string;

  @Column('text')
  cohort!: string;

  constructor(init?: Partial<Patient>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
