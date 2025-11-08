-- ================================================
-- UPDATE USERS TABLE - Add Address & Updated_at
-- ================================================

-- Add address column for shipping/delivery address
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add updated_at column to track profile updates
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create or replace trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify columns exist
DO $$ 
BEGIN
    -- Check if address column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' 
        AND column_name='address'
    ) THEN
        RAISE NOTICE 'Column "address" successfully added to users table';
    END IF;

    -- Check if updated_at column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name='users' 
        AND column_name='updated_at'
    ) THEN
        RAISE NOTICE 'Column "updated_at" successfully added to users table';
    END IF;
END $$;

-- Display updated table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;
