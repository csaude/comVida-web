import {
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Column,
} from 'typeorm';
import { Patient } from 'src/entities/patient/Patient'; // Importa a entidade Patient
import { EligibilityCategory } from './EligibilityCategory';

@Entity('eligibility_category_patient') // Mapeia esta classe para a tabela "eligibility_category_patient"
export class EligibilityCategoryPatient {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Patient)
  @JoinColumn({ name: 'patient_id' })
  patient!: Patient;

  @ManyToOne(() => EligibilityCategory)
  @JoinColumn({ name: 'category_id' })
  category!: EligibilityCategory;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  creationDate!: Date;

  constructor(init?: Partial<EligibilityCategoryPatient>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
