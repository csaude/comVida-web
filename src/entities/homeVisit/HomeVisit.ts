import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/entities/patient/Patient'; // Importa a entidade Patient

@Entity('home_visit') // Mapeia esta classe para a tabela "home_visit"
export class HomeVisit {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Patient) // Relacionamento com a tabela Patient
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column('jsonb') // Supondo que "form" seja um JSON estruturado
  form!: any;

  @Column('integer')
  visit_number!: number;

  @Column('integer')
  cohort_number_id!: number;

  constructor(init?: Partial<HomeVisit>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
