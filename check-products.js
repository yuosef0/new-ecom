#!/usr/bin/env node

/**
 * Check Database Products
 * التحقق من المنتجات في قاعدة البيانات
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const envVars = {};

envContent.split(/\r?\n/).forEach(line => {
    if (line.trim().startsWith('#') || !line.trim()) return;
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
        envVars[match[1].trim()] = match[2].trim();
    }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProducts() {
    console.log('🔍 Checking products in database...\n');

    try {
        // Get active products
        const { data: products, error } = await supabase
            .from('products')
            .select(`
        id,
        name,
        slug,
        base_price,
        is_active,
        product_images(url, is_primary)
      `)
            .eq('is_active', true)
            .limit(5);

        if (error) {
            console.error('❌ Error fetching products:', error.message);
            return;
        }

        if (!products || products.length === 0) {
            console.log('⚠️  No active products found in database!');
            console.log('');
            console.log('You need to add products first.');
            console.log('Check the admin panel or add products manually.');
            return;
        }

        console.log(`✅ Found ${products.length} active product(s):\n`);

        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name}`);
            console.log(`   ID: ${product.id}`);
            console.log(`   Slug: ${product.slug}`);
            console.log(`   Price: ${product.base_price} EGP`);
            console.log(`   Images: ${product.product_images?.length || 0}`);
            console.log('');
        });

        // Get variants for first product
        if (products.length > 0) {
            const firstProduct = products[0];
            console.log(`📦 Checking variants for "${firstProduct.name}"...\n`);

            const { data: variants, error: variantsError } = await supabase
                .from('product_variants')
                .select(`
          id,
          stock_quantity,
          is_active,
          sizes(name),
          colors(name, hex_code)
        `)
                .eq('product_id', firstProduct.id)
                .eq('is_active', true);

            if (variantsError) {
                console.log('⚠️  Error fetching variants:', variantsError.message);
            } else if (!variants || variants.length === 0) {
                console.log('⚠️  No variants found for this product');
                console.log('   Product can still be ordered without variants');
            } else {
                console.log(`✅ Found ${variants.length} variant(s):\n`);
                variants.forEach((variant, index) => {
                    const size = variant.sizes?.name || 'N/A';
                    const color = variant.colors?.name || 'N/A';
                    console.log(`   ${index + 1}. ${size} / ${color}`);
                    console.log(`      Stock: ${variant.stock_quantity}`);
                    console.log(`      ID: ${variant.id}`);
                });
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('\n✅ Database check complete!');
        console.log('\nYou can now test checkout with:');
        console.log(`Product ID: ${products[0].id}`);
        console.log('\nRun: node test-checkout-api.js');

    } catch (error) {
        console.error('❌ Unexpected error:', error.message);
    }
}

checkProducts();
