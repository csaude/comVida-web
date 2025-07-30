import DatabaseManager from 'src/services/db/DatabaseManager'
import { EligibilityCriteria } from 'src/entities/eligibility/EligibilityCriteria'
import { Repository, Like } from 'typeorm'

class EligibilityCriteriaDAO {
  private eligibilityCriteriaRepo: Repository<EligibilityCriteria>

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource()
    this.eligibilityCriteriaRepo = dataSource.getRepository(EligibilityCriteria)
  }

  // Criar uma nova EligibilityCriteria
  async create(
    categoryData: Partial<EligibilityCriteria>,
  ): Promise<EligibilityCriteria> {
    const category = this.eligibilityCriteriaRepo.create(categoryData)
    return await this.eligibilityCriteriaRepo.save(category)
  }

  // Obter todas as EligibilityCategories
  async getAll(): Promise<EligibilityCriteria[]> {
    return await this.eligibilityCriteriaRepo.find()
  }

  // Obter uma EligibilityCriteria por ID
  async getById(id: number): Promise<EligibilityCriteria | null> {
    return await this.eligibilityCriteriaRepo.findOneBy({ id })
  }

  // Atualizar uma EligibilityCriteria
  async update(
    id: number,
    updateData: Partial<EligibilityCriteria>,
  ): Promise<EligibilityCriteria> {
    const category = await this.eligibilityCriteriaRepo.findOneBy({ id })

    if (!category) {
      throw new Error('EligibilityCriteria not found')
    }

    Object.assign(category, updateData)
    return await this.eligibilityCriteriaRepo.save(category)
  }

  // Deletar uma EligibilityCriteria
  async delete(id: number): Promise<void> {
    const category = await this.eligibilityCriteriaRepo.findOneBy({ id })

    if (!category) {
      throw new Error('EligibilityCriteria not found')
    }

    await this.eligibilityCriteriaRepo.remove(category)
  }

  // Buscar EligibilityCategories por descrição
  async search(criteria: string): Promise<EligibilityCriteria[]> {
    try {
      return await this.eligibilityCriteriaRepo.find({
        where: { description: Like(`%${criteria}%`) },
        order: { description: 'ASC' }, // Ordenar alfabeticamente pela descrição
      })
    } catch (error) {
      console.error('Error searching for eligibility categories:', error)
      throw new Error('Failed to search eligibility categories')
    }
  }
}

export default new EligibilityCriteriaDAO()
