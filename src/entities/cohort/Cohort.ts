import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('cohort') // Mapeia esta classe para a tabela "cohort"
export class Cohort {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  uuid!: string;

  @Column('text')
  name!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  constructor(init?: Partial<Cohort>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
