/**
 * CF1 Backend - Feature Toggle Model
 * Database model for persistent feature toggle management
 */

import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('feature_toggles')
export class FeatureToggle {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ type: 'boolean', default: false })
  enabled!: boolean;

  @Column()
  category!: string;

  @Column({ nullable: true })
  requiredRole?: string;

  @Column({ nullable: true })
  modifiedBy?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  lastModified!: Date;
}