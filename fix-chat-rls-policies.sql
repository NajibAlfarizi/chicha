-- =====================================================
-- FIX CHAT SYSTEM RLS POLICIES
-- Issue: Cannot create chat rooms due to RLS policy
-- =====================================================

-- 1. Drop existing policies
DROP POLICY IF EXISTS "Authenticated users can create chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Users can view their own chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Admins can view all chat rooms" ON chat_rooms;
DROP POLICY IF EXISTS "Teknisi can view their chat rooms" ON chat_rooms;

-- 2. Create new, more permissive policies for chat_rooms

-- Allow anyone authenticated to create chat rooms
CREATE POLICY "Anyone authenticated can create chat rooms"
ON chat_rooms FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow users to view their own chat rooms (as customer)
CREATE POLICY "Users can view their chat rooms"
ON chat_rooms FOR SELECT
TO authenticated
USING (
  customer_id = auth.uid()::uuid
  OR admin_id = auth.uid()::uuid
  OR teknisi_id = auth.uid()::uuid
);

-- Allow users to update their own chat rooms
CREATE POLICY "Users can update their chat rooms"
ON chat_rooms FOR UPDATE
TO authenticated
USING (
  customer_id = auth.uid()::uuid
  OR admin_id = auth.uid()::uuid
  OR teknisi_id = auth.uid()::uuid
);

-- 3. Update chat_messages policies

DROP POLICY IF EXISTS "Users can view messages in their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON chat_messages;
DROP POLICY IF EXISTS "Users can update messages in their rooms" ON chat_messages;

-- Allow users to view messages in their rooms
CREATE POLICY "Users can view their messages"
ON chat_messages FOR SELECT
TO authenticated
USING (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id = auth.uid()::uuid
  )
);

-- Allow users to send messages to their rooms
CREATE POLICY "Users can send messages"
ON chat_messages FOR INSERT
TO authenticated
WITH CHECK (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id = auth.uid()::uuid
  )
);

-- Allow users to update messages (mark as read)
CREATE POLICY "Users can update their messages"
ON chat_messages FOR UPDATE
TO authenticated
USING (
  room_id IN (
    SELECT id FROM chat_rooms
    WHERE customer_id = auth.uid()::uuid
    OR admin_id = auth.uid()::uuid
    OR teknisi_id = auth.uid()::uuid
  )
);

-- 4. Grant necessary permissions
GRANT ALL ON chat_rooms TO authenticated;
GRANT ALL ON chat_messages TO authenticated;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test: Check if user can create a room
-- SELECT * FROM chat_rooms;

-- Test: Check if policies are active
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
-- FROM pg_policies 
-- WHERE tablename IN ('chat_rooms', 'chat_messages');

-- =====================================================
-- NOTES:
-- - RLS is still enabled for security
-- - Policies now allow authenticated users to:
--   1. Create chat rooms (any authenticated user)
--   2. View rooms they are part of
--   3. Send messages to their rooms
--   4. Update messages (for read receipts)
-- =====================================================
