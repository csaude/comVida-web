import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('concept') // Mapeia esta classe para a tabela "concept"
export class Concept {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('date')
  dateCreated!: Date;

  @Column('jsonb') // Supondo que "form" seja um JSON estruturado
  form!: any;

  @Column('text')
  uuid!: string;

  constructor(init?: Partial<Concept>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
