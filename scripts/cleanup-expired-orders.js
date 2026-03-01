const { createClient } = require('@supabase/supabase-js');

// Get environment variables (Next.js loads them automatically)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('❌ Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to check if payment is expired
function isPaymentExpired(order) {
  if (!order.payment_expired_at) {
    // Fallback: if no payment_expired_at, check if more than 24 hours since order creation
    const createdAt = new Date(order.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    return hoursDiff > 24;
  }
  
  const expiredAt = new Date(order.payment_expired_at);
  return new Date() > expiredAt;
}

async function cleanupExpiredOrders() {
  try {
    console.log('🔍 Scanning for expired orders...\n');

    // Get all pending orders with pending payment
    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .eq('status', 'pending')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching orders:', error);
      return;
    }

    console.log(`📊 Found ${orders.length} pending orders with pending payment\n`);

    // Filter expired orders
    const expiredOrders = orders.filter(order => isPaymentExpired(order));

    console.log(`⏰ Found ${expiredOrders.length} expired orders to cancel\n`);

    if (expiredOrders.length === 0) {
      console.log('✅ No expired orders found. All orders are up to date!');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // Process each expired order
    for (const order of expiredOrders) {
      const orderId = order.id.substring(0, 8);
      const createdDate = new Date(order.created_at).toLocaleDateString('id-ID');
      
      console.log(`\n📦 Processing order ${orderId}...`);
      console.log(`   User: ${order.user_id}`);
      console.log(`   Created: ${createdDate}`);
      console.log(`   Total: Rp ${order.total_amount.toLocaleString('id-ID')}`);

      try {
        // Update order status
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            status: 'dibatalkan',
            payment_status: 'expired',
            cancel_reason: 'Pembayaran melebihi batas waktu (otomatis dibatalkan sistem)',
            cancelled_at: new Date().toISOString()
          })
          .eq('id', order.id);

        if (updateError) {
          console.error(`   ❌ Failed to update order:`, updateError.message);
          failCount++;
          continue;
        }

        // Restore product stock
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id);

        if (itemsError) {
          console.error(`   ⚠️  Failed to fetch order items:`, itemsError.message);
          failCount++;
          continue;
        }

        if (orderItems && orderItems.length > 0) {
          console.log(`   📦 Restoring stock for ${orderItems.length} items...`);
          
          for (const item of orderItems) {
            const { error: stockError } = await supabase.rpc('increment_product_stock', {
              product_id: item.product_id,
              qty: item.quantity
            });

            if (stockError) {
              console.error(`   ⚠️  Failed to restore stock for product ${item.product_id}:`, stockError.message);
            } else {
              console.log(`   ✅ Restored ${item.quantity} units for product ${item.product_id}`);
            }
          }
        }

        console.log(`   ✅ Order ${orderId} cancelled successfully`);
        successCount++;

      } catch (err) {
        console.error(`   ❌ Error processing order ${orderId}:`, err.message);
        failCount++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully cancelled: ${successCount} orders`);
    console.log(`❌ Failed: ${failCount} orders`);
    console.log(`📦 Total processed: ${expiredOrders.length} orders`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupExpiredOrders()
  .then(() => {
    console.log('✅ Cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  });
