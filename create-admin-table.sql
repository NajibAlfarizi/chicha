-- ================================================
-- CREATE ADMIN TABLE
-- ================================================
CREATE TABLE admin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE admin IS 'Admin users for the system';

-- Add comments to columns
COMMENT ON COLUMN admin.username IS 'Unique username for admin login';
COMMENT ON COLUMN admin.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN admin.status IS 'Account status: active or inactive';
