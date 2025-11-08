-- ============================================
-- TEMPORARY: ALLOW INSERT PRODUCTS FOR TESTING
-- Jalankan ini di Supabase SQL Editor
-- ============================================

-- Drop policy lama untuk products
DROP POLICY IF EXISTS "Admins can insert products" ON products;
DROP POLICY IF EXISTS "Admins can update products" ON products;
DROP POLICY IF EXISTS "Admins can delete products" ON products;

-- Buat policy baru yang lebih permisif untuk testing
-- Mengizinkan semua authenticated users untuk insert (TEMPORARY!)
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Catatan: Setelah testing, ganti dengan policy yang benar:
-- CREATE POLICY "Admins can insert products" ON products
--   FOR INSERT 
--   WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');
