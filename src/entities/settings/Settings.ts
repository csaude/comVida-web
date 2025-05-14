import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('settings')
export class Settings {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column('text')
  uuid!: string;

  @Column('json', { nullable: true })
  setup!: Record<string, any> | null;

  constructor(init?: Partial<Settings>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
// The Settings class represents a settings entity in the database.
