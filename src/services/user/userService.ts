import api from '../api/apiService';
import { LoginResponse } from '../../model/login/LoginResponse'; 
import EncryptionManager from 'src/utils/EncryptionManager';
import UserDAO from '../db/dao/user/UserDAO'; // For local database operations
import { User } from 'src/entities/user/User'; // User and LoginResponse types

class UserService {
  /**
   * Login a user by first checking the local database. If the user doesn't exist locally,
   * authenticate via API, then save the user in the local database.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns LoginResponse - Authenticated session data.
   */
  async login(username: string, password: string): Promise<LoginResponse> {
    // Check if the user exists in the local database
    const localUser = await UserDAO.getByUsername(username);

    if (localUser) {
      // Verify the stored password (assuming it's encrypted)
      const storedPassword = EncryptionManager.getDecryptedSessionItem('password');

      if (storedPassword === password) {
        throw new Error('Incorrect password for local user.');
        // User authenticated locally
        // console.log('User authenticated locally:', localUser);
        // this.handleLocalLoginResponse(localUser);
        // return {
        //   sessionId: localUser.uuid,  // Using uuid as session ID locally
        //   //user: localUser,
        //   locale: this.getLocale() || 'en',
        //   allowedLocales: this.getAllowedLocales(),
        //   authenticated: true,
        // };
      } else {
        throw new Error('Incorrect password for local user.');
      }
    } else {
      // First login: Authenticate via API
      return await this.loginViaAPI(username, password);
    }
  }

  /**
   * Authenticate the user via API for the first login and save user locally.
   * @param username - The username of the user.
   * @param password - The password of the user.
   * @returns LoginResponse - Authenticated session data.
   */
  private async loginViaAPI(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await api.get<LoginResponse>('/session', {
        auth: { username, password },
      });

      if (response.data.authenticated) {
        // Handle login response and save session data
        this.handleLoginResponse(response.data);

        // Save user to local database for future logins
        await UserDAO.create(response.data.user);

        // Encrypt and store credentials
        EncryptionManager.setEncryptedSessionItem('username', username);
        EncryptionManager.setEncryptedSessionItem('password', password);

        console.log('User authenticated via API and saved locally:', response.data.user);
        return response.data;
      } else {
        throw new Error('Authentication failed. Please check your credentials.');
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('API Login error:', error.message);
        throw error;
      } else {
        console.error('Unexpected login error:', error);
        throw new Error('Unexpected error occurred during login.');
      }
    }
  }

  /**
   * Handle the login response from the API and store session details in sessionStorage.
   * @param data - The login response data.
   */
  handleLoginResponse(data: LoginResponse) {
    console.log(data);
    // const { sessionId, user, locale, allowedLocales } = data;

    // sessionStorage.setItem('sessionId', sessionId);
    // sessionStorage.setItem('userInfo', JSON.stringify(user));
    // sessionStorage.setItem('locale', locale);
    // sessionStorage.setItem('allowedLocales', JSON.stringify(allowedLocales));
    // sessionStorage.setItem('privileges', JSON.stringify(user.privileges));
    // sessionStorage.setItem('roles', JSON.stringify(user.roles));
  }

  /**
   * Handle local login by setting session data for a locally authenticated user.
   * @param user - The user object from the local database.
   */
  handleLocalLoginResponse(user: User) {
    console.log(user);
    // sessionStorage.setItem('sessionId', user.uuid);
    // sessionStorage.setItem('userInfo', JSON.stringify(user));
    // sessionStorage.setItem('locale', this.getLocale() || 'en');
    // sessionStorage.setItem('allowedLocales', JSON.stringify(this.getAllowedLocales()));
    // sessionStorage.setItem('privileges', JSON.stringify(user.privileges));
    // sessionStorage.setItem('roles', JSON.stringify(user.roles));
  }

  /**
   * Logout the current user by clearing session data.
   */
  async logout() {
    try {
      const sessionId = this.getSessionId();
      if (!sessionId) {
        console.warn('No session found to logout.');
        return;
      }

      const username = EncryptionManager.getDecryptedSessionItem('username');
      const password = EncryptionManager.getDecryptedSessionItem('password');

      if (!username || !password) {
        console.warn('No valid credentials found for logout.');
        return;
      }

      // Attempt API logout if connected
      await api.delete('/session', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa(`${username}:${password}`)}`,
        },
      });

      console.log('Successfully logged out from the server.');
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      sessionStorage.clear();
      sessionStorage.setItem('justLoggedOut', 'true');
      window.location.reload();
    }
  }

  /**
   * Retrieve the logged-in user's information from sessionStorage.
   */
  getLoggedUser(): User | null {
    const userInfo = sessionStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  /**
   * Retrieve the session ID.
   */
  getSessionId(): string | null {
    return sessionStorage.getItem('sessionId');
  }

  /**
   * Retrieve user privileges from sessionStorage.
   */
  getPrivileges(): string[] {
    const privileges = sessionStorage.getItem('privileges');
    return privileges ? JSON.parse(privileges) : [];
  }

  /**
   * Retrieve user roles from sessionStorage.
   */
  getRoles(): string[] {
    const roles = sessionStorage.getItem('roles');
    return roles ? JSON.parse(roles) : [];
  }

  /**
   * Retrieve the user's current locale from sessionStorage.
   */
  getLocale(): string | null {
    return sessionStorage.getItem('locale');
  }

  /**
   * Retrieve the allowed locales from sessionStorage.
   */
  getAllowedLocales(): string[] {
    const allowedLocales = sessionStorage.getItem('allowedLocales');
    return allowedLocales ? JSON.parse(allowedLocales) : [];
  }
}

export default new UserService();
