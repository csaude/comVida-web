import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

class SecureKeyManager {
  private static instance: SecureKeyManager;
  private secureStorage = SecureStoragePlugin;

  private constructor() {}

  /**
   * Singleton pattern to ensure only one instance of SecureKeyManager exists.
   */
  public static getInstance(): SecureKeyManager {
    if (!SecureKeyManager.instance) {
      SecureKeyManager.instance = new SecureKeyManager();
    }
    return SecureKeyManager.instance;
  }

  /**
   * Set a secure key.
   * @param key The key under which the value is stored.
   * @param value The value to be securely stored.
   */
  public async setKey(key: string, value: string): Promise<void> {
    try {
      await this.secureStorage.set({ key, value });
      console.log(`Secure key "${key}" stored successfully.`);
    } catch (error) {
      console.error(`Error setting secure key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Get a secure key.
   * @param key The key to retrieve the stored value.
   * @returns The value associated with the given key.
   */
  public async getKey(key: string): Promise<string | null> {
    try {
      const result = await this.secureStorage.get({ key });
      console.log(`Secure key "${key}" retrieved successfully.`);
      return result.value || null;
    } catch (error) {
      console.error(`Error retrieving secure key "${key}":`, error);
      return null; // Return null if key does not exist or an error occurs
    }
  }

  /**
   * Check if a secure key exists.
   * @param key The key to check for existence.
   * @returns True if the key exists, false otherwise.
   */
  public async hasKey(key: string): Promise<boolean> {
    try {
      const result = await this.secureStorage.get({ key });
      return !!result.value;
    } catch (error) {
      console.error(`Error checking existence of secure key "${key}":`, error);
      return false;
    }
  }

  /**
   * Delete a secure key.
   * @param key The key to delete.
   */
  public async deleteKey(key: string): Promise<void> {
    try {
      await this.secureStorage.remove({ key });
      console.log(`Secure key "${key}" deleted successfully.`);
    } catch (error) {
      console.error(`Error deleting secure key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Clear all secure keys.
   */
  public async clearAllKeys(): Promise<void> {
    try {
      await this.secureStorage.clear();
      console.log('All secure keys cleared successfully.');
    } catch (error) {
      console.error('Error clearing secure keys:', error);
      throw error;
    }
  }

   /**
   * Generate a new random passphrase.
   */
   public generatePassphrase(): string {
    return Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * Store the passphrase securely.
   * @param passphrase The passphrase to be securely stored.
   */
  public async storePassphrase(passphrase: string): Promise<void> {
    try {
      await this.secureStorage.set({ key: 'db_passphrase', value: passphrase });
      console.log('Passphrase stored securely.');
    } catch (error) {
      console.error('Error storing passphrase:', error);
      throw error;
    }
  }

  /**
   * Retrieve the stored passphrase securely.
   */
  public async getPassphrase(): Promise<string | null> {
    try {
      const { value } = await this.secureStorage.get({ key: 'db_passphrase' });
      console.log('Passphrase retrieved successfully.');
      return value || null;
    } catch (error) {
      console.warn('Passphrase not found or error retrieving it:', error);
      return null;
    }
  }
}

export default SecureKeyManager;
