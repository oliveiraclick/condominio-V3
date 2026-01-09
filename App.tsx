import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from './types';
import { supabase } from './supabase';

// Imports de Páginas e Componentes
import { SplashScreen, LoginScreen, RoleSelection, ResidentRegistration, ProfessionalRegistration } from './pages/Auth';
import {
  ResidentHome, Marketplace, AppNavigation, AcessoPage,
  FinanceiroPage, ChamadosPage, CondoAgendaPage, ServicosFullView,
  DesapegoFullView, ResidentProfile, ResidentBookings, CreateDesapegoPage,
  AssembliesPage, ShopDetailPage, DesapegoDetailView, ProductDetailPage,
  PersonalDataPage, PrivacyPage
} from './pages/Resident';
import { CommunicationHub } from './pages/CommunicationHub';
import {
  ProfessionalDashboard, ProfessionalAgenda, ProfessionalNavigation,
  ProfessionalServices, ProfessionalEarnings, ProfessionalProfileView, ProfessionalShop
} from './pages/Professional';
import {
  AdminDashboard, AdminResidents, AdminNotices, AdminAccess,
  AdminReservations, AdminConciergeChat, AdminFinance, AdminPackages,
  AdminNavigation, AdminIncidents, AdminGarage, AdminLostFound, AdminPolls, AdminMaintenance,
  AdminSystemUsers, AdminCategories, AdminProfile
} from './pages/Admin';
import { SuperAdmin } from './pages/SuperAdmin';

const App: React.FC = () => {
  // --- ESTADOS DE CONTROLE DE FLUXO ---
  const [appState, setAppState] = useState<'splash' | 'login' | 'roleSelection' | 'registerResident' | 'registerProfessional' | 'main'>('splash');
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [history, setHistory] = useState<string[]>(['home']);
  const [activeTab, setActiveTabRaw] = useState<string>('home');
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
  };

  const pushScreen = (tab: string) => {
    setHistory(prev => [...prev, tab]);
    setActiveTabRaw(tab);
  };

  const baseScreen = (tab: string) => {
    setHistory([tab]);
    setActiveTabRaw(tab);
  };

  const goBack = () => {
    setHistory(prev => {
      if (prev.length <= 1) return prev;
      const newHist = prev.slice(0, -1);
      setActiveTabRaw(newHist[newHist.length - 1]);
      return newHist;
    });
  };

  // --- ESTADOS DE DADOS ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDesapego, setSelectedDesapego] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [desapegos, setDesapegos] = useState<any[]>([]);
  const [onSitePros, setOnSitePros] = useState<any[]>([]);
  const [commonAreas, setCommonAreas] = useState<any[]>([]);
  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [accessList, setAccessList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- 1. LÓGICA DE BUSCA DE PERFIL ---
  const fetchUserProfile = useCallback(async (userId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2500));

    try {
      const fetchProfileOp = supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      const { data: profile } = await Promise.race([fetchProfileOp, timeout]) as any;

      if (profile) {
        let role = profile.role as UserRole;
        if (profile.email === 'denys@morador.com.br') role = UserRole.SUPER_ADMIN;

        console.log('[App] Perfil carregado:', { role, name: profile.name });
        setUserRole(role);
        localStorage.setItem('userRole_cache', role);

        setCurrentUser({
          ...profile,
          avatar: profile.avatar || `https://picsum.photos/seed/${profile.name}/150`,
          condo: 'Carregando...',
          role: role
        });

        if (profile.condominium_id) {
          supabase.from('condominiums').select('name').eq('id', profile.condominium_id).maybeSingle()
            .then(({ data: condo }) => {
              if (condo) setCurrentUser((prev: any) => ({ ...prev, condo: condo.name }));
            });
        }

        setAppState('main');
        // Redirecionamento correto por Role
        if (role === UserRole.RESIDENT) {
          baseScreen('home');
        } else {
          baseScreen('dashboard');
        }
      } else {
        setAppState('roleSelection');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      const cachedRole = localStorage.getItem('userRole_cache') as UserRole;
      if (cachedRole) {
        setUserRole(cachedRole);
        setCurrentUser({ id: userId, name: 'Usuário', condo: 'Offline', role: cachedRole });
        setAppState('main');
        baseScreen(cachedRole === UserRole.RESIDENT ? 'home' : 'dashboard');
      } else {
        setAppState('login');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // --- 2. GERENCIADOR DE AUTENTICAÇÃO ---
  useEffect(() => {
    const initAuth = async () => {
      let { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        setSession(initialSession);
        const cached = localStorage.getItem('userRole_cache');
        if (cached) {
          setUserRole(cached as UserRole);
          setAppState('main');
          setLoading(false);
        }
        await fetchUserProfile(initialSession.user.id, !!cached);
      } else {
        setAppState('login');
        setLoading(false);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null); setUserRole(null); setCurrentUser(null);
        localStorage.removeItem('userRole_cache');
        setAppState('login');
      } else if (newSession) {
        setSession(newSession);
        if (newSession.user.id !== session?.user?.id) await fetchUserProfile(newSession.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [fetchUserProfile]);

  // --- 4. CARREGAMENTO DE DADOS ---
  const refreshAppData = useCallback(async () => {
    if (appState !== 'main' || !session) return;
    try {
      const [areas, resvs, requests, pros, cats, onSite, prods, desap] = await Promise.all([
        supabase.from('common_areas').select('*').order('name'),
        supabase.from('reservations').select('*').order('date'),
        supabase.from('service_requests').select('*, profiles(name, phone)').order('created_at', { ascending: false }),
        supabase.from('professional_services').select('*, profiles(name, phone, is_on_site)').eq('active', true),
        supabase.from('categories').select('*').order('name'),
        supabase.from('profiles').select('*').eq('role', 'professional').eq('is_on_site', true),
        supabase.from('products').select('*, vendor:profiles!vendor_id(name, avatar)').eq('available', true).order('created_at', { ascending: false }),
        supabase.from('marketplace').select('*').eq('status', 'available').order('created_at', { ascending: false })
      ]);

      if (areas.data) setCommonAreas(areas.data);
      if (resvs.data) setReservations(resvs.data);
      if (requests.data) {
        const mapped = requests.data.map(r => ({ ...r, user: r.profiles?.name, phone: r.profiles?.phone }));
        setServiceRequests(mapped);
        setActiveServices(mapped.filter((r: any) => r.status === 'accepted'));
      }
      if (pros.data) setProfessionalServices(pros.data.map(p => ({ ...p, providerName: p.profiles?.name, providerPhone: p.profiles?.phone })));
      if (onSite.data) setOnSitePros(onSite.data);
      if (cats.data) setCategories(cats.data);
      if (prods.data) setProducts(prods.data);
      if (desap.data) setDesapegos(desap.data);
    } catch (e) { console.error("Erro refresh", e); }
  }, [appState, session]);

  useEffect(() => { refreshAppData(); }, [refreshAppData]);

  // --- HANDLERS ---
  const handleUpdateServiceRequest = async (id: number | string, status: string) => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
    if (!error) refreshAppData();
  };

  const handleAddServiceRequest = async (req: any) => {
    if (!session?.user) return;
    const { error } = await supabase.from('service_requests').insert([{
      resident_id: session.user.id,
      title: req.title || req.name,
      category: req.category || 'Solicitação',
      description: req.description || req.name,
      status: 'pending',
      unit: currentUser?.unit,
      location: `${currentUser?.tower} - ${currentUser?.unit}`,
      provider_id: req.professional_id
    }]);
    if (!error) { alert('Chamado aberto!'); refreshAppData(); } else alert(error.message);
  };

  const navigateToCategory = (category: string) => { setSelectedCategory(category); pushScreen('servicos-full'); };
  const handleSelectDesapego = (item: any) => { setSelectedDesapego(item); pushScreen('desapego-detail'); };
  const handleSelectProduct = (item: any) => { setSelectedProduct(item); pushScreen('shop-product-detail'); };

  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    try {
      if (!userRole || !currentUser) return null;

      // LÓGICA RESIDENTE
      if (userRole === UserRole.RESIDENT) {
        switch (activeTab) {
          case 'resident':
          case 'home': return <ResidentHome onNavigate={pushScreen} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} currentUser={currentUser} notifications={notifications} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} onSitePros={onSitePros} categories={categories} />;
          case 'market': return <Marketplace onNavigate={pushScreen} onSelectCategory={navigateToCategory} services={professionalServices} products={products} />;
          case 'profile': return <ResidentProfile currentUser={currentUser} onNavigate={pushScreen} />;
          case 'acesso': return <AcessoPage onBack={goBack} accessList={accessList} onAddAccess={async (access) => { await supabase.from('access_control').insert([{ resident_id: session.user.id, visitor_name: access.name, type: access.type, date: access.date, unit: currentUser?.unit, tower: currentUser?.tower }]); refreshAppData(); }} currentUser={currentUser} />;
          case 'financeiro': return <FinanceiroPage onBack={goBack} invoices={invoices} />;
          case 'chamado': return <CommunicationHub onBack={goBack} currentUser={currentUser} />;
          case 'condo-agenda': return <CondoAgendaPage onBack={goBack} reservations={reservations} commonAreas={commonAreas} onAddReservation={async (res) => {
            const insertData: any = {
              resident_id: session.user.id,
              area_id: res.areaId,
              area_name: res.area,
              date: res.date,
              status: 'confirmed',
              unit: currentUser?.unit,
              tower: currentUser?.tower
            };
            if (res.startTime && res.endTime) {
              insertData.start_time = res.startTime;
              insertData.end_time = res.endTime;
            } else if (res.timeSlot) {
              insertData.time_slot = res.timeSlot;
            }
            const { error } = await supabase.from('reservations').insert([insertData]);
            if (!error) { refreshAppData(); } else { throw new Error(error.message); }
          }} />;
          case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} onBack={goBack} onNavigate={pushScreen} onServiceRequest={handleAddServiceRequest} services={professionalServices} />;
          case 'personal-data': return <PersonalDataPage onBack={goBack} currentUser={currentUser} />;
          case 'privacy': return <PrivacyPage onBack={goBack} />;
          default: return <ResidentHome onNavigate={pushScreen} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} currentUser={currentUser} notifications={[]} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} categories={categories} onSitePros={onSitePros} />;
        }
      }

      // LÓGICA PROFISSIONAL (CORRIGIDA)
      if (userRole === UserRole.PROFESSIONAL) {
        console.log('[App] Rendering Professional, activeTab:', activeTab);
        const pending = serviceRequests.filter(r => r.status === 'pending');
        const accepted = serviceRequests.filter(r => r.status === 'accepted');
        const completed = serviceRequests.filter(r => r.status === 'completed');

        switch (activeTab) {
          case 'dashboard': return <ProfessionalDashboard serviceRequests={pending} activeServices={accepted} completedServices={completed} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={pushScreen} />;
          case 'services': return <ProfessionalServices currentUser={currentUser} />;
          case 'agenda': return <ProfessionalAgenda activeServices={accepted} onUpdateRequest={handleUpdateServiceRequest} currentUser={currentUser} serviceRequests={serviceRequests} />;
          case 'earnings': return <ProfessionalEarnings services={completed} />;
          case 'shop': return <ProfessionalShop currentUser={currentUser} />;
          case 'profile': return <ProfessionalProfileView currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />;
          default: return <ProfessionalDashboard serviceRequests={pending} activeServices={accepted} completedServices={completed} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={pushScreen} />;
        }
      }

      // LÓGICA ADMIN
      if (userRole === UserRole.ADMIN) {
        switch (activeTab) {
          case 'dashboard': return <AdminDashboard onNavigate={pushScreen} />;
          case 'admin-residents': return <AdminResidents onBack={goBack} />;
          case 'admin-access': return <AdminAccess onBack={goBack} accessList={accessList} onCheckIn={refreshAppData} />;
          case 'admin-incidents': return <AdminIncidents onBack={goBack} serviceRequests={serviceRequests} onUpdateRequest={handleUpdateServiceRequest} />;
          case 'admin-reservations': return <AdminReservations onBack={goBack} reservations={reservations} setReservations={setReservations} commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={refreshAppData} />;
          case 'admin-categories': return <AdminCategories onBack={goBack} categories={categories} onRefresh={refreshAppData} />;
          case 'profile': return <AdminProfile currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />;
          default: return <AdminDashboard onNavigate={pushScreen} />;
        }
      }

      if (userRole === UserRole.SUPER_ADMIN) return <SuperAdmin onLogout={() => supabase.auth.signOut()} currentUser={currentUser} />;
      return null;
    } catch (error) {
      console.error('Erro ao renderizar conteúdo:', error);
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Erro ao carregar</h2>
            <p className="text-sm text-slate-500">Ocorreu um erro ao carregar a página.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-violet-600 text-white rounded-xl font-bold"
            >
              Recarregar App
            </button>
          </div>
        </div>
      );
    }
  };

  if (appState === 'splash') return <SplashScreen onFinish={() => { if (session && userRole) setAppState('main'); else setAppState('login'); }} />;
  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>;
  if (appState === 'login') return <LoginScreen onLogin={async (session) => { const s = session || (await supabase.auth.getSession()).data.session; if (s) fetchUserProfile(s.user.id); }} onRegister={() => setAppState('roleSelection')} />;
  if (appState === 'roleSelection') return <RoleSelection onSelect={(role) => { setUserRole(role); setAppState(role === UserRole.RESIDENT ? 'registerResident' : 'registerProfessional'); }} onBack={() => setAppState('login')} />;
  if (appState === 'registerResident') return <ResidentRegistration onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;
  if (appState === 'registerProfessional') return <ProfessionalRegistration onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;

  const isSubPage = ['acesso', 'financeiro', 'chamado', 'condo-agenda', 'servicos-full', 'desapego-full', 'desapego-detail', 'shop-detail', 'shop-product-detail', 'create-desapego', 'admin-access', 'admin-reservations', 'admin-incidents', 'admin-categories'].includes(activeTab);

  return (
    <div className="relative max-w-md mx-auto shadow-2xl min-h-screen bg-[#f8fafc] overflow-hidden border-x border-slate-100">
      {renderContent()}
      {!isSubPage && userRole && (
        userRole === UserRole.RESIDENT ? <AppNavigation activeTab={activeTab} onChange={baseScreen} /> :
          userRole === UserRole.PROFESSIONAL ? <ProfessionalNavigation activeTab={activeTab} onChange={baseScreen} /> :
            userRole === UserRole.ADMIN ? <AdminNavigation activeTab={activeTab} onChange={baseScreen} /> : null
      )}
    </div>
  );
};

export default App;
