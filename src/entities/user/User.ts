import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('user') // Map this class to the "user" table
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { nullable: true })
  username!: string | null;

  @Column('text', { nullable: true })
  systemId!: string | null;

  @Column('integer', { nullable: true })
  dateLastLoggedIn!: number | null;

  @Column('text', { nullable: true })
  uri!: string | null;

  @Column('text')
  uuid!: string;

  @Column('integer', { nullable: true })
  person_personId!: number | null;

  @Column('text', { nullable: true })
  person_personUuid!: string | null;

  @Column('text', { nullable: true })
  person_gender!: string | null;

  @Column('integer', { nullable: true })
  person_birthdate!: number | null;

  @Column('integer', { nullable: true })
  person_birthdateEstimated!: number | null;

  @Column('text', { nullable: true })
  person_names!: string | null;

  @Column('text', { nullable: true })
  person_attributes!: string | null;

  @Column('text', { nullable: true })
  person_addresses!: string | null;

  @Column('integer', { nullable: true })
  person_voided!: number | null;

  @Column('text', { nullable: true })
  person_personTags!: string | null;

  @Column('text', { nullable: true })
  person_uri!: string | null;

  @Column('text', { nullable: true })
  person_uuid!: string | null;

  constructor(init?: Partial<User>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
