-- CF1 Platform - Neon Database Schema
-- Complete SQL schema for PostgreSQL/Neon from TypeORM entities
-- Run this script in your Neon database to create all required tables

-- Enable UUID extension for PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- Feature Toggles Table
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_toggles (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    enabled BOOLEAN DEFAULT FALSE,
    category VARCHAR(255) NOT NULL,
    required_role VARCHAR(255),
    modified_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Users Table (Main User Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Authentication Methods
    email TEXT UNIQUE,
    password_hash TEXT,
    wallet_address TEXT UNIQUE,
    primary_auth_method VARCHAR(50) DEFAULT 'email' CHECK (primary_auth_method IN ('wallet', 'email', 'hybrid')),

    -- Profile Information
    first_name TEXT,
    last_name TEXT,
    display_name TEXT,
    profile_image_url TEXT,
    phone_number TEXT,

    -- Verification and Status
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expiry TIMESTAMP WITH TIME ZONE,
    kyc_status VARCHAR(50) DEFAULT 'not_started' CHECK (kyc_status IN ('pending', 'verified', 'rejected', 'not_started')),
    account_status VARCHAR(50) DEFAULT 'pending_verification' CHECK (account_status IN ('active', 'suspended', 'pending_verification', 'locked')),

    -- Role and Permissions
    role VARCHAR(50) DEFAULT 'investor' CHECK (role IN ('investor', 'creator', 'super_admin', 'owner')),
    permissions JSONB,

    -- Password Reset
    password_reset_token TEXT,
    password_reset_expiry TIMESTAMP WITH TIME ZONE,

    -- Security
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip TEXT,

    -- Metadata
    preferences JSONB,
    referred_by TEXT,
    accepted_terms BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,

    -- Blockchain Integration
    connected_wallets TEXT, -- JSON array as string
    wallet_verified BOOLEAN DEFAULT FALSE,

    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_wallet_address ON users(wallet_address);

-- =====================================================
-- Admin Users Table (Enhanced Admin Management)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'creator_admin' CHECK (role IN ('super_admin', 'creator_admin', 'platform_admin', 'owner')),
    permissions TEXT[], -- Array of permission strings
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    wallet_address TEXT,
    phone_number TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Proposal AI Analyses Table
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_ai_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'failed')),
    summary TEXT,
    potential_strengths JSONB, -- Array of strings
    areas_for_consideration JSONB, -- Array of strings
    complexity_score INTEGER,
    processing_time_seconds FLOAT,
    error_message TEXT,
    document_hash TEXT,
    metadata JSONB, -- Record<string, any>
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for proposal_ai_analyses table
CREATE INDEX IF NOT EXISTS idx_proposal_ai_analyses_proposal_id ON proposal_ai_analyses(proposal_id);
CREATE INDEX IF NOT EXISTS idx_proposal_ai_analyses_status ON proposal_ai_analyses(status);

-- =====================================================
-- Auto-Update Triggers (PostgreSQL equivalent of TypeORM's UpdateDateColumn)
-- =====================================================

-- Function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply auto-update triggers to all tables with updated_at column
CREATE TRIGGER update_feature_toggles_updated_at
    BEFORE UPDATE ON feature_toggles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON admin_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_proposal_ai_analyses_updated_at
    BEFORE UPDATE ON proposal_ai_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- Initial Data Seeding (Optional)
-- =====================================================

-- Insert default feature toggles (if they don't exist)
INSERT INTO feature_toggles (id, name, description, enabled, category, created_at, last_modified)
VALUES
    ('demo_mode', 'Demo Mode', 'Enable demonstration mode with sample data', FALSE, 'system', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ai_analysis', 'AI Proposal Analysis', 'Enable AI-powered proposal analysis', TRUE, 'features', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('secondary_market', 'Secondary Market', 'Enable secondary trading marketplace', FALSE, 'features', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('governance_voting', 'Governance Voting', 'Enable governance proposal voting', TRUE, 'features', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Database Configuration Complete
-- =====================================================

-- Show final table status
SELECT
    schemaname,
    tablename,
    tableowner
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('feature_toggles', 'users', 'admin_users', 'proposal_ai_analyses')
ORDER BY tablename;

-- Show table sizes
SELECT
    schemaname,
    tablename,
    attname,
    typname,
    atttypmod
FROM pg_attribute
JOIN pg_class ON pg_attribute.attrelid = pg_class.oid
JOIN pg_namespace ON pg_class.relnamespace = pg_namespace.oid
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE schemaname = 'public'
    AND tablename IN ('feature_toggles', 'users', 'admin_users', 'proposal_ai_analyses')
    AND attnum > 0
    AND NOT attisdropped
ORDER BY tablename, attnum;

-- Database schema creation complete!
-- Tables created: feature_toggles, users, admin_users, proposal_ai_analyses
-- Auto-update triggers enabled for all timestamp fields
-- Initial feature toggles seeded
-- Ready for TypeORM integration with CF1 Platform