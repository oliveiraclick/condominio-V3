
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ynpogzyojijqzrngsnac.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlucG9nenlvamlqcXpybmdzbmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4Mjc5MDYsImV4cCI6MjA4MTQwMzkwNn0.mSG0dzO9A-SAUlqgmTmx-tUV6XlnKM2ieliAbzYYdoE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCommonAreas() {
    console.log('Seeding common areas...');

    const areas = [
        {
            name: 'Churrasqueira Família',
            capacity: 20,
            description: 'Área externa coberta com churrasqueira, pia e mesas. Ideal para almoços de domingo.',
            image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
            rules: 'Limpar a grelha após o uso.'
        },
        {
            name: 'Espaço Pizza',
            capacity: 15,
            description: 'Forno de pizza a lenha e mesa grande para reuniões descontraídas.',
            image_url: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80',
            rules: 'Trazer lenha própria.'
        },
        {
            name: 'Quadra Poliesportiva',
            capacity: 12,
            description: 'Quadra reformada para Futsal e Basquete.',
            image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80',
            rules: 'Uso obrigatório de tênis adequado.'
        },
        {
            name: 'Academia Completa',
            capacity: 30,
            description: 'Equipamentos modernos, ar condicionado e TV.',
            image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
            rules: 'Higienizar aparelhos após uso.'
        },
        {
            name: 'Quiosque Gourmet',
            capacity: 10,
            description: 'Quiosque individual com churrasqueira rápida e pia.',
            image_url: 'https://images.unsplash.com/photo-1549488352-7d079313cf8c?auto=format&fit=crop&w=800&q=80',
            rules: 'Manter limpo.'
        },
        {
            name: 'Quiosque Piscina',
            capacity: 8,
            description: 'Próximo à piscina, ideal para pequenos lanches.',
            image_url: 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80',
            rules: 'Proibido vidro.'
        },
        {
            name: 'Salão de Festas',
            capacity: 50,
            description: 'Salão climatizado com mesas, cadeiras e cozinha de apoio.',
            image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80',
            rules: 'Respeitar lei do silêncio após 22h.'
        },
        {
            name: 'Salão de Jogos',
            capacity: 15,
            description: 'Mesa de sinuca, ping-pong e pebolim.',
            image_url: 'https://images.unsplash.com/photo-1596483788756-3b3d115e5797?auto=format&fit=crop&w=800&q=80',
            rules: 'Cuidado com os equipamentos.'
        }
    ];

    for (const area of areas) {
        // Check if exists
        const { data: existing } = await supabase
            .from('common_areas')
            .select('id')
            .eq('name', area.name)
            .single();

        if (!existing) {
            const { error } = await supabase.from('common_areas').insert(area);
            if (error) console.error('Error inserting ' + area.name, error);
            else console.log('Inserted: ' + area.name);
        } else {
            // Update to ensure photos and current data are there
            const { error } = await supabase
                .from('common_areas')
                .update({
                    image_url: area.image_url,
                    description: area.description,
                    capacity: area.capacity,
                    rules: area.rules
                })
                .eq('id', existing.id);

            if (error) console.error('Error updating ' + area.name, error);
            else console.log('Updated: ' + area.name);
        }
    }
}

seedCommonAreas();
