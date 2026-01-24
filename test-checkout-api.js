#!/usr/bin/env node

/**
 * Test Checkout API
 * اختبار API الدفع
 */

const testCheckoutAPI = async () => {
    console.log('🧪 Testing Checkout API...\n');

    const baseURL = 'http://localhost:3000';

    // Test data
    const checkoutData = {
        email: 'test@example.com',
        shipping: {
            full_name: 'Ahmed Mohamed',
            phone: '01012345678',
            address_line_1: '123 Test Street',
            address_line_2: 'Apt 5',
            city: 'Nasr City',
            governorate: 'Cairo',
            postal_code: '11371',
        },
        shipping_method: 'standard',
        payment_method: 'cod', // Start with COD to avoid Paymob complexity
        items: [
            {
                productId: 'test-product-id', // Will need to be replaced with real ID
                variantId: null,
                quantity: 1,
            },
        ],
    };

    try {
        console.log('📤 Sending checkout request...');
        console.log('Data:', JSON.stringify(checkoutData, null, 2));
        console.log('');

        const response = await fetch(`${baseURL}/api/checkout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(checkoutData),
        });

        console.log('📥 Response Status:', response.status, response.statusText);
        console.log('');

        const data = await response.json();
        console.log('📄 Response Data:');
        console.log(JSON.stringify(data, null, 2));
        console.log('');

        if (response.ok) {
            console.log('✅ Checkout API is working!');
            console.log('');
            console.log('Order Number:', data.order_number);
            console.log('Payment Method:', data.payment_method);

            if (data.payment_url) {
                console.log('Payment URL:', data.payment_url);
            }
        } else {
            console.log('❌ Checkout API returned an error');
            console.log('');

            if (data.error) {
                console.log('Error:', data.error);
            }

            if (data.details) {
                console.log('Details:', JSON.stringify(data.details, null, 2));
            }
        }
    } catch (error) {
        console.error('❌ Failed to test checkout API:');
        console.error(error.message);
        console.log('');
        console.log('Make sure:');
        console.log('1. Server is running (npm run dev)');
        console.log('2. Server is accessible at', baseURL);
    }
};

// Run test
testCheckoutAPI();
