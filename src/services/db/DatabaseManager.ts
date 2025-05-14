import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { CapacitorSQLite, capSQLiteResult, SQLiteConnection } from '@capacitor-community/sqlite';
import SecureKeyManager from './SecureKeyManager';
import { Patient } from '../../entities/patient/Patient';

class DatabaseManager {
  private static instance: DatabaseManager;
  private dataSource: DataSource | null = null;
  private db: SQLiteConnection | null = null;

  private constructor() {}

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  public async initDatabase(): Promise<void> {
    
    if (this.dataSource && this.dataSource.isInitialized) {
      console.log('Database is already initialized.');
      return;
    }

    const databaseName = 'sesp-csa';

    try {
      const keyManager = SecureKeyManager.getInstance();

      // Retrieve or generate a passphrase
      let passphrase = await keyManager.getPassphrase();
      if (!passphrase) {
        passphrase = keyManager.generatePassphrase();
        await keyManager.storePassphrase(passphrase);
        console.log('Generated and stored new encryption passphrase.');
      }

      // Initialize the database with the passphrase
      this.db = new SQLiteConnection(CapacitorSQLite);
      const isSecretStored: capSQLiteResult = await this.db.isSecretStored();

      console.log('passphrase==================>', passphrase);
      if (!isSecretStored.result) {
        console.log('Encryption secret not found. Setting a new secret...');
        await this.db.setEncryptionSecret(passphrase);
        console.log('Encryption secret set successfully.');
      } else {
        console.log('Encryption secret already exists.');
      }


      this.dataSource = new DataSource({
        type: 'capacitor',
        database: databaseName,
        driver: this.db,
        mode: 'secret',
        logging: true,
        migrations: [],
        entities: [Patient],
      });

      await this.dataSource.initialize();
      await this.dataSource.synchronize(true);
      console.log(`TypeORM initialized with database "${databaseName}".`);

      await this.runMigrations();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  public async runMigrations(): Promise<void> {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('Database is not initialized. Call initDatabase() first.');
    }

    try {
      const migrations = await this.dataSource.runMigrations();
      if (migrations.length > 0) {
        console.log('Migrations applied successfully:', migrations.map((m) => m.name));
      } else {
        console.log('No migrations to apply.');
      }
    } catch (error) {
      console.error('Error running migrations:', error);
      throw error;
    }
  }

  public async closeDatabase(): Promise<void> {
    if (this.dataSource && this.dataSource.isInitialized) {
      try {
        await this.dataSource.destroy();
        console.log('TypeORM connection closed.');
        this.dataSource = null;
      } catch (error) {
        console.error('Error closing TypeORM connection:', error);
        throw error;
      }
    }
  }

  public getDataSource(): DataSource {
    if (!this.dataSource || !this.dataSource.isInitialized) {
      throw new Error('Database is not initialized. Call initDatabase() first.');
    }
    return this.dataSource;
  }
}

export default DatabaseManager;
