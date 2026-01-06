-- Insert Professional Services (Providers Offering Services)
-- Note: You would normally need valid profile IDs here. 
-- For this seed to work easily, we might need to assume some profiles exist or create them.
-- WARNING: Relies on existing Profiles. If you don't have profiles, this might fail or need adjustment.
-- Ideally, insert a Dummy Provider Profile first if not exists.

-- Inserting a mock provider profile if not exists (This part is tricky in raw SQL without knowing IDs, 
-- but we can try to insert a provider user into profiles directly for testing, assuming Auth ID is handled freely or ignored for now)

-- Let's assume the current user (you) will test this. 
-- OR better: We insert some requests linked to 'random' UUIDs for now, just to show in the LIST.

insert into professional_services (title, category, description, price_range, rating, active, provider_id)
values 
('Eletricista Residencial', 'Eletricista', 'Instalação e reparo de fiação, tomadas e chuveiros.', 'R$ 100 - R$ 300', 4.8, true, (select id from profiles limit 1)),
('Marido de Aluguel', 'Reparos', 'Pequenos reparos, montagem de móveis e instalações em geral.', 'A combinar', 4.9, true, (select id from profiles limit 1));

-- Insert Service Requests (Chamados dos moradores)
-- We use auth.uid() for resident_id so YOU see them if you are logged in, 
-- OR we use random UUIDs if we want to simulate requests coming from OTHERS.

insert into service_requests (title, category, description, status, location, resident_id, created_at)
values 
('Vazamento na Pia', 'Encanador', 'A pia da cozinha está pingando muito.', 'pending', 'Bloco B - 304', (select id from profiles limit 1), now() - interval '2 hours'),
('Instalação de Ventilador', 'Eletricista', 'Preciso instalar 2 ventiladores de teto.', 'pending', 'Bloco A - 102', (select id from profiles limit 1), now() - interval '1 day'),
('Montagem de Guarda-Roupa', 'Montador', 'Guarda-roupa casal 6 portas.', 'pending', 'Bloco C - 505', (select id from profiles limit 1), now() - interval '3 hours');
