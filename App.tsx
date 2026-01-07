
import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { supabase } from './supabase';
import { SplashScreen, LoginScreen, RoleSelection, ResidentRegistration, ProfessionalRegistration } from './pages/Auth';
import {
  ResidentHome, Marketplace, AppNavigation, AcessoPage,
  FinanceiroPage, ChamadosPage, CondoAgendaPage, ServicosFullView,
  DesapegoFullView, ResidentProfile, ResidentBookings, CreateDesapegoPage,
  AssembliesPage, ShopDetailPage
} from './pages/Resident';
import {
  ProfessionalDashboard, ProfessionalAgenda, ProfessionalNavigation,
  ProfessionalServices, ProfessionalEarnings, ProfessionalProfileView
} from './pages/Professional';
import {
  AdminDashboard, AdminResidents, AdminNotices, AdminAccess,
  AdminReservations, AdminConciergeChat, AdminFinance, AdminPackages,
  AdminNavigation, AdminIncidents, AdminGarage, AdminLostFound, AdminPolls, AdminMaintenance,
  AdminSystemUsers
} from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';

const App: React.FC = () => {
  const [appState, setAppState] = useState<'splash' | 'login' | 'roleSelection' | 'registerResident' | 'registerProfessional' | 'main'>('splash');
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>({
    name: 'Alex Ferreira',
    condo: 'Splendido Residencial',
    tower: 'A',
    unit: '402-B',
    avatar: 'https://picsum.photos/seed/alex/150'
  });

  // --- ESTADOS GLOBAIS ---
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([
    {
      id: 1,
      title: 'Infiltração no Teto',
      name: 'Infiltração no Teto', // Compatibility for ProfessionalDashboard
      status: 'Aberto',
      category: 'Manutenção',
      description: 'Teto da cozinha com manchas de água.',
      desc: 'Teto da cozinha com manchas de água.', // Frontend compatibility
      date: '2026-01-05',
      time: 'Ontem', // Compatibility
      resident: 'Alex Ferreira',
      user: 'Alex Ferreira', // Compatibility
      unit: '402-B',
      location: 'Torre A - 402-B' // Compatibility
    },
    {
      id: 2,
      title: 'Barulho Excessivo',
      name: 'Barulho Excessivo',
      status: 'Em Análise',
      category: 'Reclamação',
      description: 'Vizinho do 502 com som alto após ás 22h.',
      desc: 'Vizinho do 502 com som alto após ás 22h.',
      date: '2026-01-02',
      time: '2 dias atrás',
      resident: 'Clara Mendes',
      user: 'Clara Mendes',
      unit: '105-B',
      location: 'Torre B - 105-B'
    }
  ]);

  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [desapegos, setDesapegos] = useState<any[]>([
    {
      id: 1,
      name: 'Mesa de Jantar',
      price: 'R$ 450',
      status: 'USADO',
      user: 'Carla Silva',
      tower: 'Torre B',
      img: 'https://images.unsplash.com/photo-1577141312399-3112c3756d5e?auto=format&fit=crop&w=600&q=80',
      desc: 'Mesa de madeira com 4 cadeiras em ótimo estado.'
    }
  ]);
  const [commonAreas, setCommonAreas] = useState<any[]>([]);

  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [proProducts, setProProducts] = useState<any[]>([]); // Added state

  const fetchReviews = () => console.log("Fetch reviews mock"); // Added stub
  const fetchProProducts = () => console.log("Fetch pro products mock"); // Added stub
  const calculateRating = (id: any) => 5.0; // Added stub

  // Carregar dados iniciais do Supabase
  useEffect(() => {
    if (session) {
      if (session?.user?.id) fetchUserProfile(session.user.id); // Fetch profile!
      fetchCommonAreas();
      fetchReservations();
      fetchServiceRequests();
      fetchProfessionalServices(); // NEW
    }
  }, [session]);


  const fetchCommonAreas = async () => {
    const { data, error } = await supabase.from('common_areas').select('*').order('name');
    if (!error && data) setCommonAreas(data);
  };

  const fetchProfessionalServices = async () => {
    // Select * and JOIN with profiles to get name and phone
    const { data, error } = await supabase
      .from('professional_services')
      .select('*, profiles(name, phone)')
      .eq('active', true);

    if (!error && data) {
      // Flatten the data structure for easier consumption
      const formattedData = data.map((item: any) => ({
        ...item,
        providerName: item.profiles?.name || 'Prestador',
        providerPhone: item.profiles?.phone || ''
      }));
      setProfessionalServices(formattedData);
    }
  };

  const fetchReservations = async () => {
    // Basic filtering could happen here or in RLS
    const { data, error } = await supabase.from('reservations').select('*').order('date');
    if (!error && data) setReservations(data);
  };

  const fetchServiceRequests = async () => {
    // Fetch all requests relevant to user (RLS will filter)
    const { data, error } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (!error && data) setServiceRequests(data);
  };

  const handleUpdateCommonArea = async (updatedArea: any) => {
    const { error } = await supabase.from('common_areas').upsert(updatedArea);
    if (!error) {
      alert('Área atualizada com sucesso!');
      fetchCommonAreas();
    } else {
      alert('Erro ao atualizar área.');
    }
  };

  const handleAddServiceRequest = async (req: any) => {
    // 1. Optimistic Update
    setServiceRequests([req, ...serviceRequests]);

    // 2. Persist to Supabase
    const { error } = await supabase.from('service_requests').insert({
      resident_id: currentUser?.id,
      title: req.title,
      category: req.category,
      description: req.desc, // Frontend uses 'desc', DB uses 'description'
      status: 'pending',
      location: `${currentUser?.tower || ''} - ${currentUser?.unit || ''}`
    });

    if (error) {
      console.error(error);
      alert('Erro ao abrir chamado.');
      fetchServiceRequests(); // Revert
    } else {
      alert('Chamado aberto com sucesso!');
      fetchServiceRequests();
    }
  }


  const [residents, setResidents] = useState<any[]>([]);

  const fetchResidents = async () => {
    // Only Admin should be able to list all profiles (RLS check likely needed later if sensitive)
    const { data, error } = await supabase.from('profiles').select('*').order('name');
    if (!error && data) setResidents(data);
  };

  const handleUpdateResident = async (updatedResident: any) => {
    // Optimistic
    setResidents(residents.map(r => r.id === updatedResident.id ? updatedResident : r));

    const { error } = await supabase
      .from('profiles')
      .update({
        name: updatedResident.name,
        email: updatedResident.email,
        phone: updatedResident.phone,
        unit: updatedResident.unit,
        tower: updatedResident.tower,
        cpf: updatedResident.cpf,
        rg: updatedResident.rg
      })
      .eq('id', updatedResident.id);

    if (error) {
      alert('Erro ao atualizar perfil.');
      fetchResidents();
    }
  };

  useEffect(() => {
    if (session) {
      fetchCommonAreas();
      fetchReservations();
      fetchServiceRequests();
      fetchProfessionalServices();
      fetchReviews();
      fetchProProducts();
      if (userRole === UserRole.ADMIN) fetchResidents();
    }
  }, [session, userRole]);

  const handleUpdateServiceRequest = async (id: number | string, status: string) => {
    // 1. Optimistic Update (UI feels instant)
    setServiceRequests(serviceRequests.map(req => req.id === id ? { ...req, status } : req));

    // 2. Persist to Supabase
    const { error } = await supabase
      .from('service_requests')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating service request:', error);
      alert('Erro ao atualizar status. Verifique sua conexão.');
      fetchServiceRequests(); // Revert on fail
    } else {
      // Optional: Refresh to get server-side triggers if any
      // fetchServiceRequests(); 
    }
  };
  const [notifications, setNotifications] = useState<any[]>([
    { id: 1, title: 'Encomenda Recebida', desc: 'Chegou uma encomenda para você no Locker 03.', time: '5 min', read: false },
    { id: 2, title: 'Reserva Confirmada', desc: 'Salão de Festas reservado para 20/01.', time: '1h', read: true },
    { id: 3, title: 'Visitante Autorizado', desc: 'Carlos Silva (Técnico) acessou o condomínio.', time: '3h', read: true },
  ]);

  const handleAddNotification = (notification: any) => {
    setNotifications([notification, ...notifications]);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const [accessList, setAccessList] = useState<any[]>([]);

  // Carregar lista de acessos ao iniciar
  useEffect(() => {
    if (session) fetchAccessList();
  }, [session]);

  const fetchAccessList = async () => {
    // Fetch all for Admin, or only own for Resident (handled by RLS policies ideally, but for Admin view we might need explicit select)
    // Since RLS is "Resident view own", "Admin view all", simple select * works if RLS is correct.
    // To get Resident Name for Admin view, we join profiles.
    const { data, error } = await supabase
      .from('access_control')
      .select('*, profiles(name, unit, tower)')
      .order('date', { ascending: true });

    if (!error && data) {
      const formatted = data.map((item: any) => ({
        id: item.id,
        name: item.visitor_name,
        type: item.type,
        date: item.date,
        status: item.status,
        residentId: item.resident_id,
        residentName: item.profiles?.name,
        unit: item.profiles?.unit,
        tower: item.profiles?.tower
      }));
      setAccessList(formatted);
    }
  };

  const handleAddAccess = async (newAccess: any) => {
    // Optimistic
    setAccessList([newAccess, ...accessList]);

    const { error } = await supabase.from('access_control').insert({
      resident_id: currentUser?.id,
      visitor_name: newAccess.name,
      type: newAccess.type,
      date: newAccess.date,
      status: 'Pendente'
    });

    if (error) {
      console.error(error);
      alert('Erro ao autorizar via Supabase.');
      fetchAccessList();
    } else {
      alert('Acesso autorizado com sucesso!');
      fetchAccessList();
    }
  };

  const handleCheckIn = async (id: string) => {
    // Optimistic
    setAccessList(accessList.map(item => item.id === id ? { ...item, status: 'Entrou' } : item));

    const { error } = await supabase
      .from('access_control')
      .update({ status: 'Entrou' })
      .eq('id', id);

    if (error) {
      alert('Erro ao registrar entrada.');
      fetchAccessList();
    }
  };

  const handleAddProfessionalService = async (service: any) => {
    if (!session?.user?.id) return;
    // Persist to Supabase
    const { error } = await supabase.from('professional_services').insert({
      provider_id: session.user.id,
      title: service.title,
      category: service.category,
      description: service.desc || '',
      price_range: service.price_range || service.price,
      active: true
    });

    if (error) {
      console.error(error);
      alert('Erro ao criar serviço.');
    } else {
      alert('Serviço criado com sucesso!');
      fetchProfessionalServices();
    }
  };

  const handleDeleteProfessionalService = async (id: string) => {
    const { error } = await supabase.from('professional_services').update({ active: false }).eq('id', id);
    if (!error) {
      fetchProfessionalServices();
    } else {
      alert('Erro ao remover serviço.');
    }
  };

  const [invoices, setInvoices] = useState<any[]>([
    { id: '1', title: 'Mensalidade Out/26', value: '450,00', status: 'Pendente', dueDate: '2026-10-10', read: false },
    { id: '2', title: 'Taxa Extra Pintura', value: '150,00', status: 'Pago', dueDate: '2026-09-15', read: true }
  ]);

  const handleAddInvoice = (newInvoice: any) => {
    setInvoices([newInvoice, ...invoices]);
  };

  useEffect(() => {
    // Escuta mudanças na autenticação - Tornando opcional para desenvolvimento UI
    if (supabase && import.meta.env.VITE_SUPABASE_URL) { // Check if supabase is configured
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          checkUserRole(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          checkUserRole(session.user.id);
        } else {
          setUserRole(null);
          setAppState('login');
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // If Supabase is not configured, proceed without authentication
      setLoading(false);
      setAppState('login'); // Go directly to login, user will select role manually
    }
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      if (!supabase || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase is not configured. Falling back to mock data.");
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (data) {
        setUserRole(data.role as UserRole);
        setCurrentUser({
          ...data,
          avatar: data.avatar || `https://picsum.photos/seed/${data.name}/150`
        });
        setAppState('main');
        if (data.role === UserRole.RESIDENT) setActiveTab('home');
        else setActiveTab('dashboard');
      } else {
        setAppState('roleSelection');
      }
    } catch (err) {
      console.error('Error checking role, falling back to mock:', err);
      // Fallback para mock se o Supabase falhar ou não estiver configurado
      setAppState('roleSelection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 1. Check active session
    supabase?.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchUserProfile(session.user.id);
    });

    // 2. Listen for changes
    const {
      data: { subscription },
    } = supabase?.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setCurrentUser(null);
        setAppState('login');
      }
    }) || { data: { subscription: { unsubscribe: () => { } } } };

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, condominiums(name)') // Join condominiums
        .eq('id', userId)
        .single();

      if (error) {
        console.log('Profile fetch error or incomplete registration:', error);
        return;
      }

      if (data) {
        setCurrentUser({
          id: data.id,
          name: data.name,
          email: data.email,
          unit: data.unit,
          tower: data.tower,
          avatar: data.avatar || `https://picsum.photos/seed/${data.name}/150`,
          role: data.role as UserRole,
          trial_ends_at: data.trial_ends_at,
          subscription_status: data.subscription_status,
          condo: data.condominiums?.name || 'Condomínio' // Load name
        });
        setUserRole(data.role as UserRole);
        setAppState('main');
      }
    } catch (err) {
      console.error('Unexpected error fetching profile:', err);
    }
  };

  const handleSplashFinish = () => {
    if (!session && import.meta.env.VITE_SUPABASE_URL) {
      setAppState('login');
    } else if (session && userRole) {
      setAppState('main');
    } else {
      // Mock fallback or loading state
      if (!import.meta.env.VITE_SUPABASE_URL) setAppState('roleSelection');
    }
  };

  const handleLogin = () => {
    // Se não houver Supabase configurado, simulamos o login
    if (!import.meta.env.VITE_SUPABASE_URL) {
      setAppState('roleSelection');
    }
    // If Supabase is configured, onAuthStateChange will handle the redirection
  };

  const handleRoleSelection = (role: UserRole) => {
    setUserRole(role);
    if (role === UserRole.RESIDENT) {
      setAppState('registerResident');
    } else if (role === UserRole.PROFESSIONAL) {
      setAppState('registerProfessional');
    } else {
      setAppState('main');
      setActiveTab('dashboard');
    }
  };

  const handleFinishRegistration = (userData: any) => {
    setAppState('login');
  };

  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('servicos-full');
  };

  const handleAddReservation = async (reservation: any) => {
    // Adicionar no Supabase
    const { error } = await supabase.from('reservations').insert({
      area_id: reservation.areaId,
      profile_id: currentUser?.id, // Assuming currentUser has the ID
      date: reservation.date,
      status: 'confirmed'
    });

    if (error) {
      console.error(error);
      alert('Erro ao realizar reserva.');
    } else {
      alert('Reserva confirma com sucesso!');
      fetchReservations(); // Refresh list
    }
  };

  const renderContent = () => {
    if (userRole === UserRole.RESIDENT) {
      switch (activeTab) {
        case 'home': return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={handleClearNotifications} shopItems={proProducts} />;
        case 'market': return <Marketplace onNavigate={setActiveTab} onSelectCategory={navigateToCategory} services={professionalServices.map(s => ({ ...s, rating: calculateRating(s.provider_id) }))} products={proProducts} />;
        case 'booking': return <ResidentBookings onBack={() => setActiveTab('home')} reservations={reservations} setReservations={setReservations} />;
        case 'profile': return <ResidentProfile currentUser={currentUser} />;
        case 'create-desapego': return <CreateDesapegoPage onBack={() => setActiveTab('home')} onAdd={(item) => setDesapegos([item, ...desapegos])} currentUser={currentUser} />;
        case 'acesso': return <AcessoPage onBack={() => setActiveTab('home')} accessList={accessList} onAddAccess={handleAddAccess} currentUser={currentUser} />;
        case 'financeiro': return <FinanceiroPage onBack={() => setActiveTab('home')} invoices={invoices} />;
        case 'chamado': return <ChamadosPage onBack={() => setActiveTab('home')} serviceRequests={serviceRequests} onAddRequest={handleAddServiceRequest} currentUser={currentUser} />;
        case 'condo-agenda': return <CondoAgendaPage onBack={() => setActiveTab('home')} reservations={reservations} onAddReservation={handleAddReservation} commonAreas={commonAreas} />;
        case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} onBack={() => setActiveTab('market')} onNavigate={setActiveTab} onServiceRequest={(req) => setServiceRequests([req, ...serviceRequests])} />;
        case 'desapego-full': return <DesapegoFullView onBack={() => setActiveTab('home')} desapegos={desapegos} />;
        case 'assemblies': return <AssembliesPage onBack={() => setActiveTab('home')} />;
        case 'shop-detail': return <ShopDetailPage onBack={() => setActiveTab('home')} />;
        default: return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={handleClearNotifications} />;
      }
    }
    else if (userRole === UserRole.PROFESSIONAL) {
      switch (activeTab) {
        case 'dashboard': return <ProfessionalDashboard serviceRequests={serviceRequests.filter(r => r.status === 'pending')} activeServices={serviceRequests.filter(r => r.status === 'accepted')} setActiveServices={() => { }} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'agenda': return <ProfessionalAgenda activeServices={serviceRequests.filter(r => r.status === 'accepted')} />;
        case 'services': return <ProfessionalServices services={professionalServices.filter(s => s.provider_id === session?.user?.id)} onAddService={handleAddProfessionalService} onDeleteService={handleDeleteProfessionalService} />;
        case 'earnings': return <ProfessionalEarnings />;
        case 'profile': return <ProfessionalProfileView currentUser={currentUser} onLogout={() => { setUserRole(null); setSession(null); setAppState('login'); }} />;
        default: return <ProfessionalDashboard serviceRequests={serviceRequests} setServiceRequests={setServiceRequests} activeServices={activeServices} setActiveServices={setActiveServices} />;
      }
    } else if (userRole === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveTab} />;
        case 'residents': return <AdminResidents onBack={() => setActiveTab('dashboard')} />;
        case 'messages': return <AdminConciergeChat onBack={() => setActiveTab('dashboard')} />;
        case 'system-users': return <AdminSystemUsers onBack={() => setActiveTab('dashboard')} />;
        case 'admin-notices': return <AdminNotices onBack={() => setActiveTab('dashboard')} onAddNotification={handleAddNotification} />;
        case 'admin-residents': return <AdminResidents onBack={() => setActiveTab('dashboard')} />;
        case 'admin-access': return <AdminAccess onBack={() => setActiveTab('dashboard')} accessList={accessList} onCheckIn={handleCheckIn} />;
        case 'admin-reservations': return <AdminReservations onBack={() => setActiveTab('dashboard')} reservations={reservations} setReservations={setReservations} commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={handleUpdateCommonArea} />;
        case 'admin-finance': return <AdminFinance onBack={() => setActiveTab('dashboard')} invoices={invoices} onAddInvoice={handleAddInvoice} />;
        case 'admin-packages': return <AdminPackages onBack={() => setActiveTab('dashboard')} packages={packages} setPackages={setPackages} />;
        case 'admin-incidents': return <AdminIncidents onBack={() => setActiveTab('dashboard')} serviceRequests={serviceRequests} onUpdateRequest={handleUpdateServiceRequest} />;
        case 'admin-garage': return <AdminGarage onBack={() => setActiveTab('dashboard')} />;
        case 'admin-lost-found': return <AdminLostFound onBack={() => setActiveTab('dashboard')} />;
        case 'admin-polls': return <AdminPolls onBack={() => setActiveTab('dashboard')} />;
        case 'admin-maintenance': return <AdminMaintenance onBack={() => setActiveTab('dashboard')} />;
        default: return <AdminDashboard onNavigate={setActiveTab} />;
      }
    } else if (userRole === UserRole.SUPER_ADMIN) {
      return <SuperAdmin onLogout={() => { setUserRole(null); setSession(null); setAppState('login'); }} currentUser={currentUser} />;
    }
    return null;
  };

  if (appState === 'splash') return <SplashScreen onFinish={handleSplashFinish} />;

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (appState === 'login') return <LoginScreen onLogin={handleLogin} onRegister={() => setAppState('roleSelection')} />;
  if (appState === 'roleSelection') return <RoleSelection onSelect={handleRoleSelection} onBack={() => setAppState('login')} />;
  if (appState === 'registerResident') return <ResidentRegistration onFinish={handleFinishRegistration} onBack={() => setAppState('roleSelection')} />;
  if (appState === 'registerProfessional') return <ProfessionalRegistration onFinish={handleFinishRegistration} onBack={() => setAppState('roleSelection')} />;

  const isSubPage = [
    'acesso', 'financeiro', 'chamado', 'condo-agenda', 'servicos-full', 'desapego-full',
    'create-desapego', 'admin-notices', 'admin-access', 'admin-reservations',
    'admin-finance', 'admin-packages', 'admin-residents', 'admin-incidents',
    'admin-garage', 'admin-lost-found', 'admin-polls', 'admin-maintenance',
    'system-users', 'super-condos', 'super-marketplace', 'super-plans',
    'super-revenue', 'super-system', 'assemblies', 'shop-detail'
  ].includes(activeTab);

  return (
    <div className="relative max-w-md mx-auto shadow-2xl min-h-screen bg-[#f8fafc] overflow-hidden border-x border-slate-100">
      {renderContent()}

      {!isSubPage && (
        userRole === UserRole.RESIDENT ? (
          <AppNavigation activeTab={activeTab} onChange={setActiveTab} />
        ) : userRole === UserRole.PROFESSIONAL ? (
          <ProfessionalNavigation activeTab={activeTab} onChange={setActiveTab} />
        ) : userRole === UserRole.ADMIN ? (
          <AdminNavigation activeTab={activeTab} onChange={setActiveTab} />
        ) : null
      )}
    </div>
  );
};

// Update renderContent calls inside App.tsx to pass new props
// Note: This tool call is modifying App.tsx again to ensure props are passed down correctly.
// I need to check renderContent function in App.tsx actually.

export default App;
