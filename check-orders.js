const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};

envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join('=').trim();
        }
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOrders() {
    console.log('\n🔍 Checking Orders...\n');

    // Get all orders
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('❌ Error fetching orders:', error.message);
        return;
    }

    if (!orders || orders.length === 0) {
        console.log('⚠️  No orders found in database');
        return;
    }

    console.log(`✅ Found ${orders.length} orders\n`);

    orders.forEach((order, index) => {
        console.log(`Order ${index + 1}:`);
        console.log(`  Order Number: ${order.order_number}`);
        console.log(`  User ID: ${order.user_id || 'Guest'}`);
        console.log(`  Status: ${order.status}`);
        console.log(`  Payment Status: ${order.payment_status}`);
        console.log(`  Total: ${order.total} EGP`);
        console.log(`  Created: ${new Date(order.created_at).toLocaleString()}`);
        console.log(`  Shipping: ${order.shipping_name}`);
        console.log(`  Address: ${order.shipping_address}`);
        console.log('');
    });

    // Check orders with user_id
    const ordersWithUser = orders.filter(o => o.user_id);
    const guestOrders = orders.filter(o => !o.user_id);

    console.log(`📊 Summary:`);
    console.log(`  Orders with User ID: ${ordersWithUser.length}`);
    console.log(`  Guest Orders: ${guestOrders.length}`);

    if (ordersWithUser.length > 0) {
        console.log(`\n✅ Orders are being saved with user_id!`);
        console.log(`   Users can see their orders on /orders page`);
    } else {
        console.log(`\n⚠️  All orders are guest orders`);
        console.log(`   Make sure users are logged in when placing orders`);
    }
}

checkOrders().catch(console.error);
