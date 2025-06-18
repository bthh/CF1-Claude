/**
 * CF1 Backend - Proposal AI Analysis Models
 * Database schema for storing AI analysis results
 */

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum AnalysisStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress', 
  COMPLETED = 'completed',
  FAILED = 'failed'
}

@Entity('proposal_ai_analyses')
@Index(['status'])
export class ProposalAnalysis {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  proposalId!: string;

  @Column({
    type: 'varchar',
    enum: AnalysisStatus,
    default: AnalysisStatus.PENDING
  })
  status!: AnalysisStatus;

  @Column({ type: 'text', nullable: true })
  summary!: string | null;

  @Column({ type: 'json', nullable: true })
  potentialStrengths!: string[] | null;

  @Column({ type: 'json', nullable: true })
  areasForConsideration!: string[] | null;

  @Column({ type: 'integer', nullable: true })
  complexityScore!: number | null;

  @Column({ type: 'float', nullable: true })
  processingTimeSeconds!: number | null;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'text', nullable: true })
  documentHash!: string | null;

  @Column({ type: 'json', nullable: true })
  metadata!: Record<string, any> | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper method to convert to API response format
  toResponse() {
    return {
      proposalId: this.proposalId,
      status: this.status,
      summary: this.summary,
      potentialStrengths: this.potentialStrengths,
      areasForConsideration: this.areasForConsideration,
      complexityScore: this.complexityScore,
      processingTimeSeconds: this.processingTimeSeconds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Helper method to check if analysis is complete
  isComplete(): boolean {
    return this.status === AnalysisStatus.COMPLETED;
  }

  // Helper method to check if analysis failed
  isFailed(): boolean {
    return this.status === AnalysisStatus.FAILED;
  }

  // Helper method to check if analysis is pending or in progress
  isProcessing(): boolean {
    return this.status === AnalysisStatus.PENDING || this.status === AnalysisStatus.IN_PROGRESS;
  }
}