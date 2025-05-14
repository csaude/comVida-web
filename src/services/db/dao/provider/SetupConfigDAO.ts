import DatabaseManager from 'src/services/db/DatabaseManager';
import { SetupConfig } from 'src/entities/settings/SetupConfig';
import { Repository } from 'typeorm';

class SetupConfigDAO {
  private setupConfigRepo: Repository<SetupConfig>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.setupConfigRepo = dataSource.getRepository(SetupConfig);
  }

  // Create a new setup configuration record
  async create(setupConfigData: Partial<SetupConfig>): Promise<SetupConfig> {
    try {
      // Evita duplicação de UUID
      if (setupConfigData.uuid) {
        const existingConfig = await this.setupConfigRepo.findOne({
          where: { uuid: setupConfigData.uuid },
        });
        if (existingConfig) {
          throw new Error('UUID already exists');
        }
      }

      const setupConfig = this.setupConfigRepo.create(setupConfigData);
      return await this.setupConfigRepo.save(setupConfig);
    } catch (error) {
      console.error('Error creating setup configuration:', error);
      throw new Error('Failed to create setup configuration');
    }
  }

  // Get all setup configurations
  async getAll(): Promise<SetupConfig[]> {
    try {
      return await this.setupConfigRepo.find({ order: { id: 'ASC' } });
    } catch (error) {
      console.error('Error fetching setup configurations:', error);
      throw new Error('Failed to fetch setup configurations');
    }
  }

  // Get a setup configuration by ID
  async getById(id: number): Promise<SetupConfig | null> {
    try {
      return await this.setupConfigRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching setup configuration by ID:', error);
      throw new Error('Failed to fetch setup configuration');
    }
  }

  // Update a setup configuration record
  async update(
    id: number,
    updateData: Partial<SetupConfig>
  ): Promise<SetupConfig> {
    try {
      const setupConfig = await this.getById(id);
      if (!setupConfig) {
        throw new Error('Setup configuration not found');
      }

      Object.assign(setupConfig, updateData);
      return await this.setupConfigRepo.save(setupConfig);
    } catch (error) {
      console.error('Error updating setup configuration:', error);
      throw new Error('Failed to update setup configuration');
    }
  }

  // Delete a setup configuration record
  async delete(id: number): Promise<void> {
    try {
      const setupConfig = await this.getById(id);
      if (!setupConfig) {
        throw new Error('Setup configuration not found');
      }

      await this.setupConfigRepo.remove(setupConfig);
    } catch (error) {
      console.error('Error deleting setup configuration:', error);
      throw new Error('Failed to delete setup configuration');
    }
  }
}

export default new SetupConfigDAO();
