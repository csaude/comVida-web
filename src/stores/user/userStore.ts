import { defineStore } from 'pinia';
import UserService from '../../services/user/userService';
import { User } from '../../entities/user/User';

export const useUserStore = defineStore('user', {
  state: () => ({
    users: [] as User[], // Cached list of users
    currentUser: null as User | null, // Logged-in user details
    isAuthenticated: false, // Authentication state
  }),
  
  actions: {
    // Login function
    async login(username: string, password: string) {
      try {
        // Attempt login via UserService
        const user = await UserService.login(username, password);
        
      
        this.isAuthenticated = true;

        console.log('User logged in successfully:', user);
      } catch (error) {
        console.error('Login failed:', error);
        throw new Error('Login failed. Please check your credentials.');
      }
    },

    // Logout function
    logout() {
      // Clear session storage
      sessionStorage.clear();
      this.currentUser = null;
      this.isAuthenticated = false;
    },
    
  },
});
