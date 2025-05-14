import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('setup_config')
export class SetupConfig {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column('text')
  uuid!: string;

  @Column('json', { nullable: true })
  setup!: Record<string, any> | null;

  constructor(init?: Partial<SetupConfig>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
// The SetupConfig class represents a setup configuration entity in the database.
