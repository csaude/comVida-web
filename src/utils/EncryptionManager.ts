import CryptoJS from 'crypto-js';

class EncryptionManager {
  private static get ENCRYPTION_KEY(): string {
    const key = import.meta.env.VITE_ENCRYPTION_KEY
    if (!key) {
      throw new Error('Encryption key is not defined in environment variables.')
    }
    return key
  }

  /**
   * Encrypts the given data using AES.
   * @param data The plain text to encrypt.
   * @returns The encrypted string.
   */
  static encrypt(data: string): string {
    if (!data) {
      throw new Error('No data provided for encryption');
    }
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY).toString();
  }

  /**
   * Decrypts the given encrypted string using AES.
   * @param encryptedData The encrypted text to decrypt.
   * @returns The decrypted plain text.
   */
  static decrypt(encryptedData: string): string {
    if (!encryptedData) {
      throw new Error('No encrypted data provided for decryption');
    }
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  /**
   * Sets a key-value pair in sessionStorage with encryption.
   * @param key The key to use for storage.
   * @param value The value to encrypt and store.
   */
  static setEncryptedSessionItem(key: string, value: string): void {
    const encryptedValue = this.encrypt(value);
    sessionStorage.setItem(key, encryptedValue);
  }

  /**
   * Retrieves and decrypts a value from sessionStorage.
   * @param key The key to retrieve from storage.
   * @returns The decrypted value or null if not found.
   */
  static getDecryptedSessionItem(key: string): string | null {
    const encryptedValue = sessionStorage.getItem(key);
    if (!encryptedValue) {
      return null;
    }
    return this.decrypt(encryptedValue);
  }

  /**
   * Removes a key from sessionStorage.
   * @param key The key to remove.
   */
  static removeSessionItem(key: string): void {
    sessionStorage.removeItem(key);
  }

  /**
 * Sets a key-value pair in localStorage with encryption.
 * @param key The key to use for storage.
 * @param value The value to encrypt and store.
 */
static setEncryptedLocalItem(key: string, value: string): void {
  const encryptedValue = this.encrypt(value)
  localStorage.setItem(key, encryptedValue)
}

/**
 * Retrieves and decrypts a value from localStorage.
 * @param key The key to retrieve from storage.
 * @returns The decrypted value or null if not found.
 */
static getDecryptedLocalItem(key: string): string | null {
  const encryptedValue = localStorage.getItem(key)
  if (!encryptedValue) return null
  return this.decrypt(encryptedValue)
}

/**
 * Removes a key from localStorage.
 * @param key The key to remove.
 */
static removeLocalItem(key: string): void {
  localStorage.removeItem(key)
}

  
}

export default EncryptionManager;
