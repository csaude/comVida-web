import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Cohort } from './Cohort';
import { Patient } from 'src/entities/patient/Patient'; // Importa a entidade Patient

@Entity('cohort_member') // Mapeia esta classe para a tabela "cohort_member"
export class CohortMember {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  uuid!: string;

  @ManyToOne(() => Cohort)
  @JoinColumn({ name: 'cohort_id' })
  cohort!: Cohort;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column('date')
  startDate!: Date;

  constructor(init?: Partial<CohortMember>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
