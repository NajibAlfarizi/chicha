-- =====================================================
-- CHAT SYSTEM IMPLEMENTATION
-- Created: November 8, 2025
-- Purpose: Enable messaging between customers, admin, and teknisi
-- =====================================================

-- 1. Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  type TEXT NOT NULL CHECK (type IN ('support', 'booking', 'order', 'direct')),
  
  -- Participants
  customer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  teknisi_id UUID REFERENCES teknisi(id) ON DELETE SET NULL,
  
  -- Related entities
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  
  -- Metadata
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  
  -- Sender (can be user or teknisi)
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'admin', 'teknisi')),
  sender_id UUID NOT NULL, -- References users.id or teknisi.id
  sender_name TEXT NOT NULL,
  
  -- Message content
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
  attachment_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_rooms_customer ON chat_rooms(customer_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_admin ON chat_rooms(admin_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_teknisi ON chat_rooms(teknisi_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_booking ON chat_rooms(booking_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_order ON chat_rooms(order_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room ON chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages(is_read) WHERE is_read = FALSE;

-- 4. Create function to update room's last_message_at
CREATE OR REPLACE FUNCTION update_chat_room_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_rooms
  SET last_message_at = NEW.created_at,
      updated_at = NEW.created_at
  WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create trigger for auto-updating room timestamp
DROP TRIGGER IF EXISTS trigger_update_room_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_room_timestamp
AFTER INSERT ON chat_messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_room_timestamp();

-- 6. Enable Row Level Security (RLS)
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS Policies for chat_rooms

-- Customers can see their own chat rooms
CREATE POLICY "Users can view their own chat rooms"
ON chat_rooms FOR SELECT
USING (
  customer_id = auth.uid()::uuid
);

-- Admins can see all chat rooms
CREATE POLICY "Admins can view all chat rooms"
ON chat_rooms FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()::uuid
    AND users.role = 'admin'
  )
);

-- Teknisi can see their assigned chat rooms
CREATE POLICY "Teknisi can view their chat rooms"
ON chat_rooms FOR SELECT
USING (
  teknisi_id IN (
    SELECT id FROM teknisi
    WHERE teknisi.id = auth.uid()::uuid
  )
);

-- Anyone can create chat rooms (will be controlled by app logic)
CREATE POLICY "Authenticated users can create chat rooms"
ON chat_rooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- 8. Create RLS Policies for chat_messages

-- Users can view messages in their rooms
CREATE POLICY "Users can view messages in their rooms"
ON chat_messages FOR SELECT
USING (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id IN (
      SELECT id FROM teknisi WHERE teknisi.id = auth.uid()::uuid
    )
  )
);

-- Users can send messages to their rooms
CREATE POLICY "Users can send messages to their rooms"
ON chat_messages FOR INSERT
WITH CHECK (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id IN (
      SELECT id FROM teknisi WHERE teknisi.id = auth.uid()::uuid
    )
  )
);

-- Users can update their own messages (mark as read)
CREATE POLICY "Users can update messages in their rooms"
ON chat_messages FOR UPDATE
USING (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id IN (
      SELECT id FROM teknisi WHERE teknisi.id = auth.uid()::uuid
    )
  )
);

-- 9. Create view for easy room access with unread counts
CREATE OR REPLACE VIEW chat_rooms_with_unread AS
SELECT 
  cr.*,
  (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND is_read = FALSE) as unread_count,
  (SELECT message FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_message,
  (SELECT sender_name FROM chat_messages WHERE room_id = cr.id ORDER BY created_at DESC LIMIT 1) as last_sender_name,
  u_customer.name as customer_name,
  u_customer.email as customer_email,
  u_admin.name as admin_name,
  t.name as teknisi_name
FROM chat_rooms cr
LEFT JOIN users u_customer ON cr.customer_id = u_customer.id
LEFT JOIN users u_admin ON cr.admin_id = u_admin.id
LEFT JOIN teknisi t ON cr.teknisi_id = t.id;

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- Create a support chat room:
-- INSERT INTO chat_rooms (type, customer_id, name)
-- VALUES ('support', 'customer-uuid', 'Support Request');

-- Create a booking chat room:
-- INSERT INTO chat_rooms (type, customer_id, teknisi_id, booking_id, name)
-- VALUES ('booking', 'customer-uuid', 'teknisi-uuid', 'booking-uuid', 'Service Discussion');

-- Send a message:
-- INSERT INTO chat_messages (room_id, sender_type, sender_id, sender_name, message)
-- VALUES ('room-uuid', 'customer', 'user-uuid', 'John Doe', 'Hello, I need help!');

-- Mark messages as read:
-- UPDATE chat_messages SET is_read = TRUE, read_at = NOW()
-- WHERE room_id = 'room-uuid' AND sender_id != 'current-user-uuid';

-- Get user's chat rooms with unread counts:
-- SELECT * FROM chat_rooms_with_unread
-- WHERE customer_id = 'user-uuid'
-- ORDER BY last_message_at DESC;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
