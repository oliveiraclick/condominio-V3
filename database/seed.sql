-- Populate Common Areas with initial data

insert into common_areas (name, category, icon, description, price, hours, inventory, photos)
values 
  (
    'Salão de Festas',
    'Salões',
    'PartyPopper',
    'Capacidade para 50 pessoas',
    '150,00',
    '08:00 - 22:00',
    '50 Cadeiras, 10 Mesas, 1 Freezer, 1 Fogão Industrial',
    ARRAY['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Quiosque 01',
    'Quiosques',
    'Flame',
    'Próximo à piscina',
    '80,00',
    '10:00 - 22:00',
    '1 Grelha, 1 Mesa Grande, 10 Banquetas',
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Quiosque 02',
    'Quiosques',
    'Flame',
    'Lado Norte, mais reservado',
    '80,00',
    '10:00 - 22:00',
    '1 Grelha, 1 Mesa Grande, 10 Banquetas',
    ARRAY['https://images.unsplash.com/photo-1533777857889-4be7c70b33f7?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Quadra de Tênis',
    'Esportes',
    'Trophy',
    'Piso rápido, iluminação LED',
    '0,00',
    '06:00 - 23:00',
    'Rede instalada, requer reserva',
    ARRAY['https://images.unsplash.com/photo-1622163642998-1ea14b60c57e?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Quadra de Beach Tennis',
    'Esportes',
    'Waves',
    'Areia fina tratada',
    '0,00',
    '07:00 - 20:00',
    'Rede e demarcação',
    ARRAY['https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=800&q=80']
  ),
  (
    'Academia',
    'Esportes',
    'Dumbbell',
    'Uso livre mediante agendamento',
    '0,00',
    '06:00 - 23:00',
    'Esteiras, Bicicletas, Pesos Livres',
    ARRAY['https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80']
  );
