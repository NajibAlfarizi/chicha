-- =====================================================
-- MIGRATION: Update Complaints Table for Reviews
-- Description: Add rating and product_id to support product reviews
-- Date: November 2025
-- =====================================================

-- Add columns for product reviews
ALTER TABLE public.complaints 
ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS rating INTEGER CHECK (rating >= 1 AND rating <= 5);

-- Create index for product reviews lookup
CREATE INDEX IF NOT EXISTS idx_complaints_product_id ON public.complaints(product_id);
CREATE INDEX IF NOT EXISTS idx_complaints_rating ON public.complaints(rating);

-- Update RLS policies to allow users to create reviews
DROP POLICY IF EXISTS "Users can create complaints" ON public.complaints;
DROP POLICY IF EXISTS "Users can view own complaints" ON public.complaints;

CREATE POLICY "Users can create complaints"
    ON public.complaints
    FOR INSERT
    TO public
    WITH CHECK (true);

CREATE POLICY "Users can view own complaints"
    ON public.complaints
    FOR SELECT
    TO public
    USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
        OR product_id IS NOT NULL  -- Allow viewing product reviews
    );

-- Allow public to view product reviews (for display on product pages)
CREATE POLICY "Public can view product reviews"
    ON public.complaints
    FOR SELECT
    TO public
    USING (product_id IS NOT NULL);

COMMENT ON COLUMN public.complaints.product_id IS 'Product ID for reviews (NULL for general complaints)';
COMMENT ON COLUMN public.complaints.rating IS 'Rating 1-5 stars for product reviews (NULL for complaints)';
