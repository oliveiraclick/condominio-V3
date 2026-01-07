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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- ESTADOS GLOBAIS ---
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [desapegos, setDesapegos] = useState<any[]>([]);
  const [commonAreas, setCommonAreas] = useState<any[]>([]);
  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [accessList, setAccessList] = useState<any[]>([]);

  // 1. ÚNICO LISTENER DE AUTENTICAÇÃO
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession) {
        await fetchUserProfile(currentSession.user.id);
      } else {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        await fetchUserProfile(newSession.user.id);
      } else {
        setUserRole(null);
        setCurrentUser(null);
        setAppState('login');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. BUSCA DE PERFIL COM LÓGICA DE AUTO-REPARO
  const fetchUserProfile = async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*, condominiums(name)')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        const role = data.role as UserRole;
        setUserRole(role);
        setCurrentUser({
          ...data,
          avatar: data.avatar || `https://picsum.photos/seed/${data.name}/150`,
          condo: data.condominiums?.name || 'Condomínio'
        });
        setAppState('main');
        setActiveTab(role === UserRole.RESIDENT ? 'home' : 'dashboard');
      } else {
        // Se logou mas não tem perfil, envia para seleção de cargo
        setAppState('roleSelection');
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      setAppState('roleSelection');
    } finally {
      setLoading(false);
    }
  };

  // 3. CARREGAMENTO DE DADOS (Apenas quando estiver no App)
  useEffect(() => {
    if (appState === 'main' && session) {
      fetchCommonAreas();
      fetchReservations();
      fetchServiceRequests();
      fetchProfessionalServices();
      fetchAccessList();
    }
  }, [appState, session]);

  // --- FUNÇÕES DE BUSCA (STUBS MANTIDOS PARA COMPATIBILIDADE) ---
  const fetchCommonAreas = async () => {
    const { data } = await supabase.from('common_areas').select('*').order('name');
    if (data) setCommonAreas(data);
  };

  const fetchProfessionalServices = async () => {
    const { data } = await supabase.from('professional_services').select('*, profiles(name, phone)').eq('active', true);
    if (data) setProfessionalServices(data.map((item: any) => ({ ...item, providerName: item.profiles?.name, providerPhone: item.profiles?.phone })));
  };

  const fetchReservations = async () => {
    const { data } = await supabase.from('reservations').select('*').order('date');
    if (data) setReservations(data);
  };

  const fetchServiceRequests = async () => {
    const { data } = await supabase.from('service_requests').select('*').order('created_at', { ascending: false });
    if (data) setServiceRequests(data);
  };

  const fetchAccessList = async () => {
    const { data } = await supabase.from('access_control').select('*, profiles(name, unit, tower)').order('date');
    if (data) setAccessList(data.map((item: any) => ({ id: item.id, name: item.visitor_name, type: item.type, date: item.date, status: item.status, residentId: item.resident_id, residentName: item.profiles?.name, unit: item.profiles?.unit, tower: item.profiles?.tower })));
  };

  const handleUpdateServiceRequest = async (id: number | string, status: string) => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
    if (!error) fetchServiceRequests();
  };

  // --- NAVEGAÇÃO ---
  const handleSplashFinish = () => {
    if (!session) setAppState('login');
    else if (userRole) setAppState('main');
    else setAppState('roleSelection');
  };

  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('servicos-full');
  };

  const renderContent = () => {
    if (!userRole || !currentUser) return null;

    if (userRole === UserRole.RESIDENT) {
      switch (activeTab) {
        case 'home': return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={() => setNotifications([])} />;
        case 'market': return <Marketplace onNavigate={setActiveTab} onSelectCategory={navigateToCategory} services={professionalServices} products={desapegos} />;
        case 'booking': return <ResidentBookings onBack={() => setActiveTab('home')} reservations={reservations} />;
        case 'profile': return <ResidentProfile currentUser={currentUser} />;
        case 'acesso': return <AcessoPage onBack={() => setActiveTab('home')} accessList={accessList} onAddAccess={async (a) => fetchAccessList()} currentUser={currentUser} />;
        case 'financeiro': return <FinanceiroPage onBack={() => setActiveTab('home')} invoices={invoices} />;
        case 'chamado': return <ChamadosPage onBack={() => setActiveTab('home')} serviceRequests={serviceRequests} onAddRequest={async (r) => fetchServiceRequests()} currentUser={currentUser} />;
        case 'condo-agenda': return <CondoAgendaPage onBack={() => setActiveTab('home')} reservations={reservations} onAddReservation={async (res) => fetchReservations()} commonAreas={commonAreas} />;
        case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} onBack={() => setActiveTab('market')} onNavigate={setActiveTab} onServiceRequest={() => { }} />;
        case 'desapego-full': return <DesapegoFullView onBack={() => setActiveTab('home')} desapegos={desapegos} />;
        case 'create-desapego': return <CreateDesapegoPage onBack={() => setActiveTab('home')} onAdd={(item) => setDesapegos([item, ...desapegos])} currentUser={currentUser} />;
        default: return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={() => { }} />;
      }
    }

    if (userRole === UserRole.PROFESSIONAL) {
      switch (activeTab) {
        case 'dashboard': return <ProfessionalDashboard serviceRequests={serviceRequests.filter(r => r.status === 'pending')} activeServices={serviceRequests.filter(r => r.status === 'accepted')} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'agenda': return <ProfessionalAgenda activeServices={serviceRequests.filter(r => r.status === 'accepted')} />;
        case 'services': return <ProfessionalServices services={professionalServices.filter(s => s.provider_id === session?.user?.id)} onAddService={() => fetchProfessionalServices()} onDeleteService={() => fetchProfessionalServices()} />;
        case 'profile': return <ProfessionalProfileView currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />;
        default: return <ProfessionalDashboard serviceRequests={serviceRequests} activeServices={activeServices} onUpdateRequest={handleUpdateServiceRequest} currentUser={currentUser} />;
      }
    }

    if (userRole === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={setActiveTab} />;
        case 'admin-residents': return <AdminResidents onBack={() => setActiveTab('dashboard')} />;
        case 'admin-access': return <AdminAccess onBack={() => setActiveTab('dashboard')} accessList={accessList} onCheckIn={() => fetchAccessList()} />;
        case 'admin-reservations': return <AdminReservations onBack={() => setActiveTab('dashboard')} reservations={reservations} setReservations={setReservations} commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={fetchCommonAreas} />;
        case 'admin-incidents': return <AdminIncidents onBack={() => setActiveTab('dashboard')} serviceRequests={serviceRequests} onUpdateRequest={handleUpdateServiceRequest} />;
        default: return <AdminDashboard onNavigate={setActiveTab} />;
      }
    }

    if (userRole === UserRole.SUPER_ADMIN) return <SuperAdmin onLogout={() => supabase.auth.signOut()} currentUser={currentUser} />;

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

  if (appState === 'login') return <LoginScreen onLogin={async (session) => {
    const currentSession = session || (await supabase.auth.getSession()).data.session;
    if (currentSession) {
      await fetchUserProfile(currentSession.user.id);
    }
  }} onRegister={() => setAppState('roleSelection')} />;
  if (appState === 'roleSelection') return <RoleSelection onSelect={(role) => { setUserRole(role); setAppState(role === UserRole.RESIDENT ? 'registerResident' : 'registerProfessional'); }} onBack={() => setAppState('login')} />;
  if (appState === 'registerResident') return <ResidentRegistration onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;
  if (appState === 'registerProfessional') return <ProfessionalRegistration onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;

  const isSubPage = ['acesso', 'financeiro', 'chamado', 'condo-agenda', 'servicos-full', 'desapego-full', 'create-desapego', 'admin-access', 'admin-reservations', 'admin-incidents'].includes(activeTab);

  return (
    <div className="relative max-w-md mx-auto shadow-2xl min-h-screen bg-[#f8fafc] overflow-hidden border-x border-slate-100">
      {renderContent()}
      {!isSubPage && userRole && (
        userRole === UserRole.RESIDENT ? <AppNavigation activeTab={activeTab} onChange={setActiveTab} /> :
          userRole === UserRole.PROFESSIONAL ? <ProfessionalNavigation activeTab={activeTab} onChange={setActiveTab} /> :
            userRole === UserRole.ADMIN ? <AdminNavigation activeTab={activeTab} onChange={setActiveTab} /> : null
      )}
    </div>
  );
};

export default App;
