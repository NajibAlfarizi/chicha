-- Create vouchers table
CREATE TABLE IF NOT EXISTS vouchers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10, 2) NOT NULL,
  min_purchase DECIMAL(10, 2) DEFAULT 0,
  max_discount DECIMAL(10, 2),
  quota INTEGER NOT NULL DEFAULT 0,
  used INTEGER NOT NULL DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create voucher_usage table (tracking)
CREATE TABLE IF NOT EXISTS voucher_usage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voucher_id UUID NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  discount_amount DECIMAL(10, 2) NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(voucher_id, order_id)
);

-- Add voucher fields to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_id UUID REFERENCES vouchers(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS voucher_code VARCHAR(50);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vouchers_code ON vouchers(code);
CREATE INDEX IF NOT EXISTS idx_vouchers_active ON vouchers(is_active);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_voucher ON voucher_usage(voucher_id);
CREATE INDEX IF NOT EXISTS idx_voucher_usage_user ON voucher_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_voucher ON orders(voucher_id);

-- Enable RLS
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vouchers (all users can read active vouchers)
CREATE POLICY "Anyone can view active vouchers" ON vouchers
  FOR SELECT
  USING (is_active = true AND NOW() BETWEEN valid_from AND valid_until);

-- RLS Policies for voucher_usage (users can only see their own usage)
CREATE POLICY "Users can view their own voucher usage" ON voucher_usage
  FOR SELECT
  USING (user_id = auth.uid());

-- Create function to increment voucher used count
CREATE OR REPLACE FUNCTION increment_voucher_used(voucher_id_param UUID)
RETURNS void AS $$
BEGIN
  UPDATE vouchers
  SET used = used + 1,
      updated_at = NOW()
  WHERE id = voucher_id_param;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE vouchers IS 'Voucher/promo codes for discounts';
COMMENT ON TABLE voucher_usage IS 'Track which users used which vouchers';
