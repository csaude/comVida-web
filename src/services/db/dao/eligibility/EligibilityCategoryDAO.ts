import DatabaseManager from 'src/services/db/DatabaseManager';
import { EligibilityCategory } from 'src/entities/eligibility/EligibilityCategory';
import { Repository, Like } from 'typeorm';

class EligibilityCategoryDAO {
  private eligibilityCategoryRepo: Repository<EligibilityCategory>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.eligibilityCategoryRepo = dataSource.getRepository(EligibilityCategory);
  }

  // Criar uma nova EligibilityCategory
  async create(categoryData: Partial<EligibilityCategory>): Promise<EligibilityCategory> {
    const category = this.eligibilityCategoryRepo.create(categoryData);
    return await this.eligibilityCategoryRepo.save(category);
  }

  // Obter todas as EligibilityCategories
  async getAll(): Promise<EligibilityCategory[]> {
    return await this.eligibilityCategoryRepo.find();
  }

  // Obter uma EligibilityCategory por ID
  async getById(id: number): Promise<EligibilityCategory | null> {
    return await this.eligibilityCategoryRepo.findOneBy({ id });
  }

  // Atualizar uma EligibilityCategory
  async update(id: number, updateData: Partial<EligibilityCategory>): Promise<EligibilityCategory> {
    const category = await this.eligibilityCategoryRepo.findOneBy({ id });

    if (!category) {
      throw new Error('EligibilityCategory not found');
    }

    Object.assign(category, updateData);
    return await this.eligibilityCategoryRepo.save(category);
  }

  // Deletar uma EligibilityCategory
  async delete(id: number): Promise<void> {
    const category = await this.eligibilityCategoryRepo.findOneBy({ id });

    if (!category) {
      throw new Error('EligibilityCategory not found');
    }

    await this.eligibilityCategoryRepo.remove(category);
  }

  // Buscar EligibilityCategories por descrição
  async search(criteria: string): Promise<EligibilityCategory[]> {
    try {
      return await this.eligibilityCategoryRepo.find({
        where: { description: Like(`%${criteria}%`) },
        order: { description: 'ASC' }, // Ordenar alfabeticamente pela descrição
      });
    } catch (error) {
      console.error('Error searching for eligibility categories:', error);
      throw new Error('Failed to search eligibility categories');
    }
  }
}

export default new EligibilityCategoryDAO();
