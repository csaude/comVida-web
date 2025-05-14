import DatabaseManager from 'src/services/db/DatabaseManager';
import { EligibilityCategoryPatient } from 'src/entities/eligibility/EligibilityCategoryPatient';
import { Repository } from 'typeorm';

class EligibilityCategoryPatientDAO {
  private eligibilityCategoryPatientRepo: Repository<EligibilityCategoryPatient>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.eligibilityCategoryPatientRepo = dataSource.getRepository(
      EligibilityCategoryPatient
    );
  }

  // Criar um novo registro de EligibilityCategoryPatient
  async create(
    data: Partial<EligibilityCategoryPatient>
  ): Promise<EligibilityCategoryPatient> {
    const record = this.eligibilityCategoryPatientRepo.create(data);
    return await this.eligibilityCategoryPatientRepo.save(record);
  }

  // Obter todos os registros de EligibilityCategoryPatient
  async getAll(): Promise<EligibilityCategoryPatient[]> {
    return await this.eligibilityCategoryPatientRepo.find({
      relations: ['patient', 'category'],
    });
  }

  // Obter um registro de EligibilityCategoryPatient por ID
  async getById(id: number): Promise<EligibilityCategoryPatient | null> {
    return await this.eligibilityCategoryPatientRepo.findOne({
      where: { id },
      relations: ['patient', 'category'],
    });
  }

  // Obter registros de EligibilityCategoryPatient por ID do paciente
  async getByPatientId(
    patientId: number
  ): Promise<EligibilityCategoryPatient[]> {
    return await this.eligibilityCategoryPatientRepo.find({
      where: { patient: { id: patientId } },
      relations: ['patient', 'category'],
    });
  }

  // Atualizar um registro de EligibilityCategoryPatient
  async update(
    id: number,
    updateData: Partial<EligibilityCategoryPatient>
  ): Promise<EligibilityCategoryPatient> {
    const record = await this.eligibilityCategoryPatientRepo.findOneBy({ id });

    if (!record) {
      throw new Error('EligibilityCategoryPatient not found');
    }

    Object.assign(record, updateData);
    return await this.eligibilityCategoryPatientRepo.save(record);
  }

  // Deletar um registro de EligibilityCategoryPatient
  async delete(id: number): Promise<void> {
    const record = await this.eligibilityCategoryPatientRepo.findOneBy({ id });

    if (!record) {
      throw new Error('EligibilityCategoryPatient not found');
    }

    await this.eligibilityCategoryPatientRepo.remove(record);
  }
}
