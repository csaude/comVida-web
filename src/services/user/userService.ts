import api from '../api/apiService';
import EncryptionManager from 'src/utils/EncryptionManager';
import { User } from 'src/entities/user/User'; // User and LoginResponse types

class UserService {
  
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('tokenExpiration');
  }
}

export default new UserService();
