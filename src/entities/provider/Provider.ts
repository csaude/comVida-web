import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('provider')
export class Provider {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index()
  @Column('text')
  uuid!: string;

  @Column('text', { nullable: true })
  description!: string | null;

  constructor(init?: Partial<Provider>) {
    if (init) {
      Object.assign(this, init);
    }
  }
}
