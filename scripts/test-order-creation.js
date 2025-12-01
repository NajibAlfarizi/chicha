#!/usr/bin/env node

/**
 * Test Order Creation
 * Script untuk test apakah order bisa dibuat via API
 */

const testOrderCreation = async () => {
  console.log('\n🧪 Testing Order Creation API\n');
  console.log('='.repeat(50));

  const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://chicha-mobile.me';
  
  // Sample order data
  const testOrder = {
    user_id: 'TEST-USER-ID', // Ganti dengan user_id yang valid
    items: [
      {
        product_id: 'TEST-PRODUCT-ID', // Ganti dengan product_id yang valid
        quantity: 1,
        price: 100000,
      }
    ],
    payment_method: 'midtrans',
    total_amount: 100000,
    subtotal: 100000,
    discount_amount: 0,
    customer_info: {
      name: 'Test User',
      email: 'test@example.com',
      phone: '081234567890',
      address: 'Test Address',
    },
    midtrans_order_id: 'TEST-' + Date.now(),
    payment_status: 'paid',
  };

  console.log('\n📦 Test Order Data:');
  console.log(JSON.stringify(testOrder, null, 2));
  console.log('\n');

  try {
    console.log(`📤 Sending POST request to ${API_URL}/api/orders...`);
    
    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder),
    });

    console.log(`\n📨 Response Status: ${response.status} ${response.statusText}`);

    const data = await response.json();
    
    if (response.ok) {
      console.log('\n✅ Order created successfully!');
      console.log('\nOrder Details:');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.log('\n❌ Failed to create order');
      console.log('\nError Details:');
      console.log(JSON.stringify(data, null, 2));
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n💡 To test with real data:');
  console.log('1. Login to https://chicha-mobile.me');
  console.log('2. Open Console (F12)');
  console.log('3. Get user_id: JSON.parse(localStorage.getItem("user")).id');
  console.log('4. Get product_id from database');
  console.log('5. Update testOrder object above');
  console.log('6. Run: node scripts/test-order-creation.js\n');
};

// Run the test
testOrderCreation().catch(console.error);
