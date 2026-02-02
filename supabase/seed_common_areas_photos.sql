-- Ensure name is unique to allow UPSERT
ALTER TABLE public.common_areas ADD CONSTRAINT common_areas_name_key UNIQUE (name);

-- Seed or Update Common Areas with Photos
INSERT INTO public.common_areas (name, capacity, description, image_url, rules)
VALUES 
    ('Churrasqueira Família', 20, 'Área externa coberta com churrasqueira, pia e mesas. Ideal para almoços de domingo.', 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80', 'Limpar a grelha após o uso.'),
    ('Espaço Pizza', 15, 'Forno de pizza a lenha e mesa grande para reuniões descontraídas.', 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&w=800&q=80', 'Trazer lenha própria.'),
    ('Quadra Poliesportiva', 12, 'Quadra reformada para Futsal e Basquete.', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80', 'Uso obrigatório de tênis adequado.'),
    ('Academia Completa', 30, 'Equipamentos modernos, ar condicionado e TV.', 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80', 'Higienizar aparelhos após uso.'),
    ('Quiosque Gourmet', 10, 'Quiosque individual com churrasqueira rápida e pia.', 'https://images.unsplash.com/photo-1549488352-7d079313cf8c?auto=format&fit=crop&w=800&q=80', 'Manter limpo.'),
    ('Quiosque Piscina', 8, 'Próximo à piscina, ideal para pequenos lanches.', 'https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=800&q=80', 'Proibido vidro.'),
    ('Salão de Festas', 50, 'Salão climatizado com mesas, cadeiras e cozinha de apoio.', 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80', 'Respeitar lei do silêncio após 22h.'),
    ('Salão de Jogos', 15, 'Mesa de sinuca, ping-pong e pebolim.', 'https://images.unsplash.com/photo-1596483788756-3b3d115e5797?auto=format&fit=crop&w=800&q=80', 'Cuidado com os equipamentos.')
ON CONFLICT (name) 
DO UPDATE SET 
    image_url = EXCLUDED.image_url,
    description = EXCLUDED.description,
    capacity = EXCLUDED.capacity,
    rules = EXCLUDED.rules;
