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

async function addDefaultMessage() {
    console.log('🔄 Adding default top bar message...');

    try {
        // Deactivate all existing messages
        await supabase
            .from('top_bar_messages')
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        console.log('✅ Deactivated existing messages');

        // Check if message already exists
        const { data: existing } = await supabase
            .from('top_bar_messages')
            .select('*')
            .eq('message_en', 'FREE SHIPPING ON All Orders')
            .single();

        if (existing) {
            console.log('⚠️ Message already exists. Activating it...');
            const { error } = await supabase
                .from('top_bar_messages')
                .update({ is_active: true })
                .eq('id', existing.id);

            if (error) throw error;
            console.log('✅ Activated existing default message');
        } else {
            // Create new message
            const { error } = await supabase
                .from('top_bar_messages')
                .insert({
                    message_en: 'FREE SHIPPING ON All Orders',
                    message_ar: null,
                    is_active: true,
                    display_order: 1
                });

            if (error) throw error;
            console.log('✅ Added new default message');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

addDefaultMessage();
