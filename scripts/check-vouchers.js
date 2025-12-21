// Script to check vouchers status
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVouchers() {
  console.log('🔍 Checking vouchers status...\n');

  // Get all vouchers
  const { data: vouchers, error } = await supabase
    .from('vouchers')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Error fetching vouchers:', error);
    return;
  }

  if (!vouchers || vouchers.length === 0) {
    console.log('⚠️  No vouchers found in database!');
    console.log('💡 Run: node scripts/create-sample-vouchers.js');
    return;
  }

  console.log(`📊 Total vouchers: ${vouchers.length}\n`);

  const now = new Date();
  
  vouchers.forEach((v, index) => {
    const validFrom = new Date(v.valid_from);
    const validUntil = new Date(v.valid_until);
    const isActive = v.is_active;
    const hasQuota = v.used < v.quota;
    const isValidPeriod = validFrom <= now && validUntil >= now;
    const willShowInHome = isActive && hasQuota && isValidPeriod;

    console.log(`${index + 1}. ${v.name} (${v.code})`);
    console.log(`   Status: ${v.is_active ? '✅ Active' : '❌ Inactive'}`);
    console.log(`   Quota: ${v.quota - v.used} / ${v.quota} remaining`);
    console.log(`   Valid: ${validFrom.toLocaleDateString('id-ID')} - ${validUntil.toLocaleDateString('id-ID')}`);
    console.log(`   Period Valid: ${isValidPeriod ? '✅' : '❌ Expired'}`);
    console.log(`   Will show in home: ${willShowInHome ? '✅ YES' : '❌ NO'}`);
    
    if (!willShowInHome) {
      const reasons = [];
      if (!isActive) reasons.push('Inactive');
      if (!hasQuota) reasons.push('No quota');
      if (!isValidPeriod) reasons.push('Expired/Not started');
      console.log(`   Reason: ${reasons.join(', ')}`);
    }
    console.log('');
  });
}

checkVouchers().catch(console.error);
