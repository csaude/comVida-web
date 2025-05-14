import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('eligibility_category') // Mapeia esta classe para a tabela "eligibility_category"
export class EligibilityCategory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text')
  description!: string;

  constructor(init?: Partial<EligibilityCategory>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
