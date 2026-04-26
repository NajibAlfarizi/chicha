-- Add biaya_perbaikan column to bookings table
ALTER TABLE bookings
ADD COLUMN biaya_perbaikan NUMERIC DEFAULT 0;

-- Add comment to explain the column
COMMENT ON COLUMN bookings.biaya_perbaikan IS 'Biaya perbaikan yang diisi setelah perbaikan selesai. Default 0 jika belum ada biaya.';
