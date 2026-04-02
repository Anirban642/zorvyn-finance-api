-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS financial_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create financial records table
CREATE TABLE financial_records (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    category VARCHAR(100) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_financial_records_user ON financial_records(user_id);
CREATE INDEX idx_financial_records_type ON financial_records(type);
CREATE INDEX idx_financial_records_date ON financial_records(date);
CREATE INDEX idx_financial_records_category ON financial_records(category);
CREATE INDEX idx_financial_records_deleted ON financial_records(is_deleted);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'Full system access - can manage users, records, and view all data'),
    ('analyst', 'Can view all records and access insights and analytics'),
    ('viewer', 'Can only view dashboard summaries and own records');

-- Display success message
SELECT 'Database schema created successfully!' AS message;