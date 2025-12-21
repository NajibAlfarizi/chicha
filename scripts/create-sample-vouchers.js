// Script to create fresh sample vouchers with valid dates
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSampleVouchers() {
  console.log('🎫 Creating fresh sample vouchers...\n');

  const now = new Date();
  const validFrom = now.toISOString();
  const validUntil = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days from now

  const vouchers = [
    {
      code: 'WELCOME10',
      name: 'Diskon 10% untuk Pelanggan Baru',
      description: 'Dapatkan diskon 10% untuk pembelian pertama Anda',
      type: 'percentage',
      value: 10.00,
      min_purchase: 50000.00,
      max_discount: 50000.00,
      quota: 100,
      used: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      is_active: true
    },
    {
      code: 'HEMAT25K',
      name: 'Potongan Langsung Rp 25.000',
      description: 'Hemat Rp 25.000 untuk belanja minimal Rp 100.000',
      type: 'fixed',
      value: 25000.00,
      min_purchase: 100000.00,
      max_discount: null,
      quota: 50,
      used: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      is_active: true
    },
    {
      code: 'BELANJA15',
      name: 'Diskon 15% Maksimal Rp 100.000',
      description: 'Diskon hingga Rp 100.000 untuk belanja minimal Rp 200.000',
      type: 'percentage',
      value: 15.00,
      min_purchase: 200000.00,
      max_discount: 100000.00,
      quota: 30,
      used: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      is_active: true
    },
    {
      code: 'NATAL25',
      name: 'Diskon Natal 25%',
      description: 'Promo spesial Natal! Diskon hingga Rp 150.000',
      type: 'percentage',
      value: 25.00,
      min_purchase: 300000.00,
      max_discount: 150000.00,
      quota: 25,
      used: 0,
      valid_from: validFrom,
      valid_until: validUntil,
      is_active: true
    }
  ];

  for (const voucher of vouchers) {
    // Check if voucher with same code already exists
    const { data: existing } = await supabase
      .from('vouchers')
      .select('id, code')
      .eq('code', voucher.code)
      .single();

    if (existing) {
      // Update existing voucher
      const { error } = await supabase
        .from('vouchers')
        .update(voucher)
        .eq('id', existing.id);

      if (error) {
        console.log(`❌ Error updating ${voucher.code}:`, error.message);
      } else {
        console.log(`✅ Updated: ${voucher.code} - ${voucher.name}`);
      }
    } else {
      // Insert new voucher
      const { error } = await supabase
        .from('vouchers')
        .insert(voucher);

      if (error) {
        console.log(`❌ Error creating ${voucher.code}:`, error.message);
      } else {
        console.log(`✅ Created: ${voucher.code} - ${voucher.name}`);
      }
    }
  }

  console.log('\n✨ Done! All vouchers are now valid for 60 days.');
  console.log(`📅 Valid from: ${new Date(validFrom).toLocaleDateString('id-ID')}`);
  console.log(`📅 Valid until: ${new Date(validUntil).toLocaleDateString('id-ID')}`);
}

createSampleVouchers().catch(console.error);
