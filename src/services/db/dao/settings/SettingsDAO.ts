import DatabaseManager from 'src/services/db/DatabaseManager';
import { Settings } from 'src/entities/settings/Settings';
import { Repository } from 'typeorm';

class SettingsDAO {
  private settingsRepo: Repository<Settings>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.settingsRepo = dataSource.getRepository(Settings);
  }

  // Create a new settings record
  async create(settingsData: Partial<Settings>): Promise<Settings> {
    try {
      // Evita duplicação de UUID
      if (settingsData.uuid) {
        const existingSettings = await this.settingsRepo.findOne({ where: { uuid: settingsData.uuid } });
        if (existingSettings) {
          throw new Error('UUID already exists');
        }
      }

      const settings = this.settingsRepo.create(settingsData);
      return await this.settingsRepo.save(settings);
    } catch (error) {
      console.error('Error creating settings:', error);
      throw new Error('Failed to create settings');
    }
  }

  // Get all settings
  async getAll(): Promise<Settings[]> {
    try {
      return await this.settingsRepo.find({ order: { id: 'ASC' } });
    } catch (error) {
      console.error('Error fetching settings:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  // Get settings by ID
  async getById(id: number): Promise<Settings | null> {
    try {
      return await this.settingsRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching settings by ID:', error);
      throw new Error('Failed to fetch settings');
    }
  }

  // Update a settings record
  async update(id: number, updateData: Partial<Settings>): Promise<Settings> {
    try {
      const settings = await this.getById(id);
      if (!settings) {
        throw new Error('Settings not found');
      }

      Object.assign(settings, updateData);
      return await this.settingsRepo.save(settings);
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('Failed to update settings');
    }
  }

  // Delete a settings record
  async delete(id: number): Promise<void> {
    try {
      const settings = await this.getById(id);
      if (!settings) {
        throw new Error('Settings not found');
      }

      await this.settingsRepo.remove(settings);
    } catch (error) {
      console.error('Error deleting settings:', error);
      throw new Error('Failed to delete settings');
    }
  }
}

export default new SettingsDAO();
