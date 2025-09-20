-- Migration 002: Create proposals table with status column
-- This migration creates a proposals table for testing and includes the status column

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create proposals table for testing
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    creator_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(255) DEFAULT 'Active'
);

-- Add index for performance when filtering by status
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Add comment for documentation
COMMENT ON COLUMN proposals.status IS 'Current status of the proposal: Active, Pending, Completed, Rejected';

-- Insert test data
INSERT INTO proposals (title, description, status) VALUES
('Test Proposal 1', 'First test proposal', 'Active'),
('Test Proposal 2', 'Second test proposal', 'Pending'),
('Test Proposal 3', 'Third test proposal', 'Completed');