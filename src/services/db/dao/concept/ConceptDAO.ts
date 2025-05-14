import DatabaseManager from 'src/services/db/DatabaseManager';
import { Concept } from 'src/entities/concept/Concept';
import { Repository } from 'typeorm';

class ConceptDAO {
  private conceptRepo: Repository<Concept>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.conceptRepo = dataSource.getRepository(Concept);
  }

  // Criar um novo conceito
  async create(conceptData: Partial<Concept>): Promise<Concept> {
    try {
      // Evita duplicação de UUID
      if (conceptData.uuid) {
        const existingConcept = await this.conceptRepo.findOne({ where: { uuid: conceptData.uuid } });
        if (existingConcept) {
          throw new Error('UUID already exists');
        }
      }

      const concept = this.conceptRepo.create(conceptData);
      return await this.conceptRepo.save(concept);
    } catch (error) {
      console.error('Error creating concept:', error);
      throw new Error('Failed to create concept');
    }
  }

  // Buscar todos os conceitos
  async getAll(): Promise<Concept[]> {
    try {
      return await this.conceptRepo.find({ order: { dateCreated: 'DESC' } });
    } catch (error) {
      console.error('Error fetching concepts:', error);
      throw new Error('Failed to fetch concepts');
    }
  }

  // Buscar um conceito por ID
  async getById(id: number): Promise<Concept | null> {
    try {
      return await this.conceptRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching concept by ID:', error);
      throw new Error('Failed to fetch concept');
    }
  }

  // Atualizar um conceito
  async update(id: number, updateData: Partial<Concept>): Promise<Concept> {
    try {
      const concept = await this.getById(id);
      if (!concept) {
        throw new Error('Concept not found');
      }

      Object.assign(concept, updateData);
      return await this.conceptRepo.save(concept);
    } catch (error) {
      console.error('Error updating concept:', error);
      throw new Error('Failed to update concept');
    }
  }

  // Excluir um conceito
  async delete(id: number): Promise<void> {
    try {
      const concept = await this.getById(id);
      if (!concept) {
        throw new Error('Concept not found');
      }

      await this.conceptRepo.remove(concept);
    } catch (error) {
      console.error('Error deleting concept:', error);
      throw new Error('Failed to delete concept');
    }
  }
}

export default new ConceptDAO();
