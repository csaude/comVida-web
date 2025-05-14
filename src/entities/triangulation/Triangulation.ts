import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

import { Patient } from 'src/entities/patient/Patient'; // Importa a entidade Patient

@Entity('triangulation') // Mapeia esta classe para a tabela "triangulation"
export class Triangulation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('text', { unique: true })
  uuid!: string;

  @Column('json')
  form!: object;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column('text')
  type!: string; // Indica se é ATS ou Visita

  @Column('integer')
  cohort_number_id!: number;

  constructor(init?: Partial<Triangulation>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
