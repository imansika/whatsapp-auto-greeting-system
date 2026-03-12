-- Migration: Remove full_name column if it exists, add phone column if needed

-- Remove full_name column if it exists
ALTER TABLE users DROP COLUMN IF EXISTS full_name;

-- Add phone column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Display table structure to verify
DESCRIBE users;
