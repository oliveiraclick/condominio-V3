
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedBanners() {
    console.log('Checking existing banners...');
    const { data: existing, error: countError } = await supabase
        .from('banners')
        .select('*');

    if (countError) {
        console.error('Error checking banners:', countError);
        return;
    }

    console.log(`Found ${existing.length} banners.`);

    if (existing.length < 2) {
        console.log('Inserting demo banners...');

        const bannersToInsert = [
            {
                image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Bem-vindo ao Novo CondoHub',
                link_url: '#',
                active: true,
                display_order: 1
            },
            {
                image_url: 'https://images.unsplash.com/photo-1558981806-ec527fa84f3d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                title: 'Novas Regras da Piscina',
                link_url: '#',
                active: true,
                display_order: 2
            }
        ];

        // Filter out ones that might conflict by title roughly (simple check)
        const newBanners = bannersToInsert.filter(b => !existing.some(e => e.title === b.title));

        if (newBanners.length > 0) {
            const { error } = await supabase.from('banners').insert(newBanners);
            if (error) console.error('Error inserting:', error);
            else console.log(`Successfully inserted ${newBanners.length} banners!`);
        } else {
            console.log('Demo banners already exist.');
        }
    } else {
        console.log('Carousel already has enough banners (2+). Skipping seed.');
    }
}

seedBanners();
