import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Job {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  company: string;

  @Column({ nullable: true })
  skills: string; 

  @Column({ nullable: true })
  location: string;

  @Column('text')
  description: string;

  @Column({ type: 'double precision', nullable: true })
  salaryMin: number | null;

  @Column({ type: 'double precision', nullable: true })
  salaryMax: number | null;

  @Column({ type: 'integer', nullable: true })
  experienceRequired: number | null;  // in years

  @Column({
    type: 'enum',
    enum: ['full-time', 'part-time', 'contract', 'remote', 'hybrid'],
    default: 'full-time',
  })
  jobType: string;

  @Column({ type: 'integer', nullable: true })
  postedBy: number | null;   // recruiter user id (nullable for external/system jobs)

  @Column({ default: false })
  isExternal: boolean;

  @Column({ type: 'varchar', nullable: true })
  externalSource: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalUrl: string | null;

  @Column({ type: 'varchar', nullable: true })
  externalCurrency: string | null;

  @Column('json', { nullable: true })
  raw: any;

  @Column({
    type: 'enum',
    enum: ['open', 'closed', 'paused'],
    default: 'open',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

}
