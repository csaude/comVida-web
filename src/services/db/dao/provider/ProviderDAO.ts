import DatabaseManager from 'src/services/db/DatabaseManager';
import { Provider } from 'src/entities/provider/Provider';
import { Repository } from 'typeorm';

class ProviderDAO {
  private providerRepo: Repository<Provider>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.providerRepo = dataSource.getRepository(Provider);
  }

  // Create a new provider record
  async create(providerData: Partial<Provider>): Promise<Provider> {
    try {
      // Evita duplicação de UUID
      if (providerData.uuid) {
        const existingProvider = await this.providerRepo.findOne({ where: { uuid: providerData.uuid } });
        if (existingProvider) {
          throw new Error('UUID already exists');
        }
      }

      const provider = this.providerRepo.create(providerData);
      return await this.providerRepo.save(provider);
    } catch (error) {
      console.error('Error creating provider:', error);
      throw new Error('Failed to create provider');
    }
  }

  // Get all providers
  async getAll(): Promise<Provider[]> {
    try {
      return await this.providerRepo.find({ order: { id: 'ASC' } });
    } catch (error) {
      console.error('Error fetching providers:', error);
      throw new Error('Failed to fetch providers');
    }
  }

  // Get a provider by ID
  async getById(id: number): Promise<Provider | null> {
    try {
      return await this.providerRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching provider by ID:', error);
      throw new Error('Failed to fetch provider');
    }
  }

  // Update a provider record
  async update(id: number, updateData: Partial<Provider>): Promise<Provider> {
    try {
      const provider = await this.getById(id);
      if (!provider) {
        throw new Error('Provider not found');
      }

      Object.assign(provider, updateData);
      return await this.providerRepo.save(provider);
    } catch (error) {
      console.error('Error updating provider:', error);
      throw new Error('Failed to update provider');
    }
  }

  // Delete a provider record
  async delete(id: number): Promise<void> {
    try {
      const provider = await this.getById(id);
      if (!provider) {
        throw new Error('Provider not found');
      }

      await this.providerRepo.remove(provider);
    } catch (error) {
      console.error('Error deleting provider:', error);
      throw new Error('Failed to delete provider');
    }
  }
}

export default new ProviderDAO();
