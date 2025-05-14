import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('location') // Map this class to the "location" table
export class Location {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('integer')
  voided!: number;

  @Column('text', { nullable: true })
  uri!: string | null;

  @Column('text')
  uuid!: string;

  constructor(init?: Partial<Location>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
