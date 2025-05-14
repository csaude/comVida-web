//import DatabaseManager from 'src/services/db/DatabaseManager';
import { User } from 'src/entities/user/User';
import { Repository, Like } from 'typeorm';

class UserDAO {
  private userRepo: Repository<User>;

  constructor() {
    // const dataSource = DatabaseManager.getInstance().getDataSource();
    // this.userRepo = dataSource.getRepository(User); // Initialize the repository for the User entity
  }

  // Create a new user record
  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepo.create(userData);
    return await this.userRepo.save(user);
  }

  // Get all users
  async getAll(): Promise<User[]> {
    return await this.userRepo.find();
  }

  // Get a user by ID
  async getById(id: number): Promise<User | null> {
    return await this.userRepo.findOneBy({ id });
  }

  // Update a user record
  async update(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateData);
    return await this.userRepo.save(user);
  }

  // Delete a user record
  async delete(id: number): Promise<void> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepo.remove(user);
  }

  // Search for users
  async search(criteria: string): Promise<User[]> {
    try {
      return await this.userRepo.find({
        where: [
          { username: Like(`%${criteria}%`) },
          { person_names: Like(`%${criteria}%`) },
          { person_attributes: Like(`%${criteria}%`) },
          { person_addresses: Like(`%${criteria}%`) },
        ],
        order: { username: 'ASC' }, // Order by username alphabetically
      });
    } catch (error) {
      console.error('Error searching for users:', error);
      throw new Error('Failed to search users');
    }
  }

  // Get user by username (for login)
  async getByUsername(username: string): Promise<User | null> {
    try {
      return await this.userRepo.findOneBy({ username });
    } catch (error) {
      console.error('Error fetching user by username:', error);
      throw new Error('Failed to fetch user');
    }
  }
}

export default new UserDAO();
