import DatabaseManager from 'src/services/db/DatabaseManager';
import { Cohort } from 'src/entities/cohort/Cohort';
import { Repository, Like } from 'typeorm';

class CohortDAO {
  private cohortRepo: Repository<Cohort>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.cohortRepo = dataSource.getRepository(Cohort);
  }

  // Criar um novo registro de Cohort
  async create(cohortData: Partial<Cohort>): Promise<Cohort> {
    const cohort = this.cohortRepo.create(cohortData);
    return await this.cohortRepo.save(cohort);
  }

  // Obter todos os Cohorts
  async getAll(): Promise<Cohort[]> {
    return await this.cohortRepo.find();
  }

  // Obter um Cohort por ID
  async getById(id: number): Promise<Cohort | null> {
    return await this.cohortRepo.findOneBy({ id });
  }

  // Atualizar um Cohort
  async update(id: number, updateData: Partial<Cohort>): Promise<Cohort> {
    const cohort = await this.cohortRepo.findOneBy({ id });

    if (!cohort) {
      throw new Error('Cohort not found');
    }

    Object.assign(cohort, updateData);
    return await this.cohortRepo.save(cohort);
  }

  // Deletar um Cohort
  async delete(id: number): Promise<void> {
    const cohort = await this.cohortRepo.findOneBy({ id });

    if (!cohort) {
      throw new Error('Cohort not found');
    }

    await this.cohortRepo.remove(cohort);
  }

  // Buscar Cohorts por nome ou descrição
  async search(criteria: string): Promise<Cohort[]> {
    try {
      return await this.cohortRepo.find({
        where: [
          { name: Like(`%${criteria}%`) },
          { description: Like(`%${criteria}%`) },
        ],
        order: { name: 'ASC' }, // Ordenar alfabeticamente pelo nome
      });
    } catch (error) {
      console.error('Error searching for cohorts:', error);
      throw new Error('Failed to search cohorts');
    }
  }
}

export default new CohortDAO();
