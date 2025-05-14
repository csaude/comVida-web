import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Patient } from 'src/entities/patient/Patient'; // Importa a entidade Patient

@Entity('ats') // Mapeia esta classe para a tabela "ats"
export class ATS {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Patient) // Relacionamento com a tabela Patient
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @Column('jsonb') // Supondo que "form" seja um JSON estruturado
  form!: any;

  constructor(init?: Partial<ATS>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
