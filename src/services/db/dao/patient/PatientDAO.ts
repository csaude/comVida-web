import DatabaseManager from 'src/services/db/DatabaseManager';
import { Patient } from 'src/entities/patient/Patient';
import { Repository, Like } from 'typeorm';

class PatientDAO {
  private patientRepo: Repository<Patient>;

  constructor() {
    const dataSource = DatabaseManager.getInstance().getDataSource();
    this.patientRepo = dataSource.getRepository(Patient);
  }

  // Create a new patient record
  async create(patientData: Partial<Patient>): Promise<Patient> {
    try {
      // Evita duplicação de UUID
      if (patientData.uuid) {
        const existingPatient = await this.patientRepo.findOne({ where: { uuid: patientData.uuid } });
        if (existingPatient) {
          throw new Error('UUID already exists');
        }
      }

      const patient = this.patientRepo.create(patientData);
      return await this.patientRepo.save(patient);
    } catch (error) {
      console.error('Error creating patient:', error);
      throw new Error('Failed to create patient');
    }
  }

  // Get all patients
  async getAll(): Promise<Patient[]> {
    try {
      return await this.patientRepo.find({ order: { names: 'ASC' } });
    } catch (error) {
      console.error('Error fetching patients:', error);
      throw new Error('Failed to fetch patients');
    }
  }

  // Get a patient by ID
  async getById(id: number): Promise<Patient | null> {
    try {
      return await this.patientRepo.findOne({ where: { id } });
    } catch (error) {
      console.error('Error fetching patient by ID:', error);
      throw new Error('Failed to fetch patient');
    }
  }

  // Update a patient record
  async update(id: number, updateData: Partial<Patient>): Promise<Patient> {
    try {
      const patient = await this.getById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }

      Object.assign(patient, updateData);
      return await this.patientRepo.save(patient);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw new Error('Failed to update patient');
    }
  }

  // Delete a patient record
  async delete(id: number): Promise<void> {
    try {
      const patient = await this.getById(id);
      if (!patient) {
        throw new Error('Patient not found');
      }

      await this.patientRepo.remove(patient);
    } catch (error) {
      console.error('Error deleting patient:', error);
      throw new Error('Failed to delete patient');
    }
  }

  // Search for patients
  async search(criteria: string): Promise<Patient[]> {
    try {
      return this.getAll();
    } catch (error) {
      console.error('Error searching for patients:', error);
      throw new Error('Failed to search patients');
    }
  }
}

export default new PatientDAO();
