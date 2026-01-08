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
import {
  ProfessionalDashboard, ProfessionalAgenda, ProfessionalNavigation,
  ProfessionalServices, ProfessionalEarnings, ProfessionalProfileView, ProfessionalShop
} from './pages/Professional';
import {
  AdminDashboard, AdminResidents, AdminNotices, AdminAccess,
  AdminReservations, AdminConciergeChat, AdminFinance, AdminPackages,
  AdminNavigation, AdminIncidents, AdminGarage, AdminLostFound, AdminPolls, AdminMaintenance,
  AdminSystemUsers, AdminCategories
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

  // WRAPPER: Synchronize activeTab with History
  const setActiveTab = (tab: string) => {
    setActiveTabRaw(tab);
    // Note: We don't auto-push to history here to avoid duplicates during "Back" actions
    // Navigation should use specific helpers below
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

  // --- ESTADOS DE DADOS (MARKETPLACE E GESTÃO) ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDesapego, setSelectedDesapego] = useState<any>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [desapegos, setDesapegos] = useState<any[]>([]);
  const [commonAreas, setCommonAreas] = useState<any[]>([]);
  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [accessList, setAccessList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // --- 1. LÓGICA DE BUSCA DE PERFIL (COM BLINDAGEM ANTI-LOOP) ---
  const fetchUserProfile = useCallback(async (userId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);

    // Timeout safeguard for Login Loop Protection
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 2500));

    try {
      const fetchProfileOp = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile } = await Promise.race([fetchProfileOp, timeout]) as any;

      if (profile) {
        let role = profile.role as UserRole;

        // --- DEVELOPER BYPASS: FORCE SUPER ADMIN ---
        if (profile.email === 'denys@morador.com.br') {
          role = UserRole.SUPER_ADMIN;
        }

        setUserRole(role);

        // Cache de Role para evitar flicker no carregamento
        localStorage.setItem('userRole_cache', role);

        // Set UI State IMMEDIATELY (Non-blocking Condo Fetch)
        setCurrentUser({
          ...profile,
          avatar: profile.avatar || `https://picsum.photos/seed/${profile.name}/150`,
          condo: 'Carregando...',
          role: role
        });

        // Busca nome do condomínio em background
        if (profile.condominium_id) {
          supabase.from('condominiums').select('name').eq('id', profile.condominium_id).maybeSingle()
            .then(({ data: condo }) => {
              if (condo) setCurrentUser((prev: any) => ({ ...prev, condo: condo.name }));
            });
        }

        setAppState('main');

        // Direct to Dashboard for Admin/Pro roles
        if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN || role === UserRole.PROFESSIONAL) {
          baseScreen('dashboard');
        } else {
          baseScreen('home');
        }
      } else {
        setAppState('roleSelection');
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      // OFFLINE FALLBACK: Only activate if we have a Cached Role (Evidence of recent login)
      // This prevents the "Logout Loop" where a failed fetch (cancelled by logout) forces a re-login
      const cachedRole = localStorage.getItem('userRole_cache') as UserRole;

      if (cachedRole) {
        console.log('Ativando modo Offline Fallback...');
        setUserRole(cachedRole);
        setCurrentUser({
          id: userId,
          name: 'Bem-vindo!',
          condo: 'Modo Offline',
          unit: '...',
          tower: '...',
          email: '',
          role: cachedRole,
        } as any);
        setAppState('main');
        setAppState('main');
        baseScreen('home');
      } else {
        // No cache? It's a genuine logout or error. Go to login.
        setAppState('login');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // --- 2. GERENCIADOR DE AUTENTICAÇÃO ---
  useEffect(() => {
    const initAuth = async () => {
      // Patience Strategy: Wait a bit if session is null initially
      let { data: { session: initialSession } } = await supabase.auth.getSession();

      if (!initialSession) {
        await new Promise(r => setTimeout(r, 1000));
        const retry = await supabase.auth.getSession();
        initialSession = retry.data.session;
      }

      if (initialSession) {
        setSession(initialSession);
        // Tenta usar cache para renderizar UI rápido
        const cached = localStorage.getItem('userRole_cache');
        if (cached) {
          setUserRole(cached as UserRole);
          setAppState('main');
          setLoading(false); // Release splash immediately while fetching fresh data
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
        setSession(null);
        setUserRole(null);
        setCurrentUser(null);
        localStorage.removeItem('userRole_cache');
        setAppState('login');
      } else if (newSession) {
        setSession(newSession);
        // Só busca perfil se mudou o usuário
        if (newSession.user.id !== session?.user?.id) {
          await fetchUserProfile(newSession.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // --- 3. AUTO-REPAIR PARA MODO OFFLINE ---
  useEffect(() => {
    if (currentUser?.name === 'Bem-vindo!' && session?.user?.id) {
      const timer = setTimeout(() => {
        console.log('Tentando reconectar perfil...');
        fetchUserProfile(session.user.id, true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // --- 4. CARREGAMENTO DE DADOS DO CONDOMÍNIO (OPTIMIZED) ---
  const refreshAppData = useCallback(async () => {
    if (appState !== 'main' || !session) return;

    // Parallel Fetching for Maximum Speed
    const [areas, resvs, requests, pros, access, prods, mkt, cats] = await Promise.all([
      supabase.from('common_areas').select('*').order('name'),
      supabase.from('reservations').select('*').order('date'),
      supabase.from('service_requests').select('*, profiles(name, phone)').order('created_at', { ascending: false }),
      supabase.from('professional_services').select('*, profiles(name, phone)').eq('active', true),
      supabase.from('access_control').select('*, profiles(name, unit, tower)').order('date'),
      supabase.from('products').select('*, profiles(name)').order('created_at', { ascending: false }),
      supabase.from('marketplace').select('*, profiles(name, unit, tower, phone)').order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name')
    ]);

    if (areas.data) setCommonAreas(areas.data);
    if (resvs.data) setReservations(resvs.data);

    if (requests.data) {
      const mappedRequests = requests.data.map(r => ({ ...r, user: r.profiles?.name, phone: r.profiles?.phone }));
      setServiceRequests(mappedRequests);
      setActiveServices(mappedRequests.filter((r: any) => r.status === 'accepted'));
    }

    if (pros.data) setProfessionalServices(pros.data.map(p => ({ ...p, providerName: p.profiles?.name, providerPhone: p.profiles?.phone })));
    if (access.data) setAccessList(access.data.map(a => ({ ...a, name: a.visitor_name, residentName: a.profiles?.name, unit: a.profiles?.unit })));
    if (prods.data) setProducts(prods.data);
    if (cats.data) setCategories(cats.data);

    if (mkt.data) {
      setDesapegos(mkt.data.map(i => ({
        id: i.id,
        name: i.title,
        price: `R$ ${i.price}`,
        img: i.image_url,
        user: i.profiles?.name || 'Vizinho',
        status: i.status.toUpperCase(),
        desc: i.description,
        tower: i.profiles ? `${i.profiles.tower} - ${i.profiles.unit}` : 'Residencial',
        phone: i.profiles?.phone
      })));
    }
  }, [appState, session]);

  useEffect(() => { refreshAppData(); }, [refreshAppData]);

  // --- 5. PAGINAÇÃO E HANDLERS ---
  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    pushScreen('shop-detail');
  };

  const handleSelectDesapego = (item: any) => {
    setSelectedDesapego(item);
    pushScreen('desapego-detail');
  };

  const handleSelectProduct = (item: any) => {
    setSelectedProduct(item);
    pushScreen('shop-product-detail');
  };

  // --- HANDLERS GENÉRICOS (RE-USÁVEIS) ---
  const handleUpdateServiceRequest = async (id: number | string, status: string) => {
    const { error } = await supabase.from('service_requests').update({ status }).eq('id', id);
    if (!error) refreshAppData();
  };

  const handleAddProduct = async (product: any) => {
    if (!session?.user) return;
    let finalImageUrl = product.image_url;
    if (product.image_file) {
      const fileName = `${Math.random()}.${product.image_file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('products').upload(`${session.user.id}/${fileName}`, product.image_file);
      if (!upErr) {
        const { data } = supabase.storage.from('products').getPublicUrl(`${session.user.id}/${fileName}`);
        finalImageUrl = data.publicUrl;
      }
    }
    const { image_file, ...productData } = product;
    const { error } = await supabase.from('products').insert([{ ...productData, image_url: finalImageUrl, vendor_id: session.user.id }]);
    if (!error) refreshAppData(); else alert(error.message);
  };

  const handleDeleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (!error) refreshAppData();
  };

  const handleToggleProductStatus = async (product: any) => {
    const { error } = await supabase.from('products').update({ available: !product.available }).eq('id', product.id);
    if (!error) refreshAppData();
  };

  const handleAddDesapego = async (item: any) => {
    if (!session?.user) return;
    let finalImageUrl = item.img;
    if (item.image_file) {
      const fileName = `${Date.now()}.${item.image_file.name.split('.').pop()}`;
      const { error: upErr } = await supabase.storage.from('marketplace').upload(`${session.user.id}/${fileName}`, item.image_file);
      if (!upErr) {
        const { data } = supabase.storage.from('marketplace').getPublicUrl(`${session.user.id}/${fileName}`);
        finalImageUrl = data.publicUrl;
      }
    }
    const { error } = await supabase.from('marketplace').insert([{
      seller_id: session.user.id, title: item.name, price: parseFloat(item.price.replace('R$', '').replace(',', '.').trim()),
      status: item.status, description: item.desc, image_url: finalImageUrl
    }]);
    if (!error) { refreshAppData(); baseScreen('home'); } else alert(error.message);
  };

  const handleDeleteDesapego = async (id: string) => {
    const { error } = await supabase.from('marketplace').delete().eq('id', id);
    if (!error) { alert('Anúncio removido!'); refreshAppData(); baseScreen('home'); }
  };

  const handleAddServiceRequest = async (req: any) => {
    if (!session?.user) return;
    const { error } = await supabase.from('service_requests').insert([{
      resident_id: session.user.id, title: req.title || req.name, category: req.category || 'Solicitação',
      description: req.description || req.name, status: 'Aberto', unit: currentUser?.unit, location: `${currentUser?.tower} - ${currentUser?.unit}`,
      professional_id: req.professional_id
    }]);
    if (!error) { alert('Chamado aberto!'); refreshAppData(); } else alert(error.message);
  };

  // --- RENDERIZAÇÃO PRINCIPAL ---
  const renderContent = () => {
    if (!userRole || !currentUser) return null;

    // --- RESIDENTE ---
    if (userRole === UserRole.RESIDENT) {
      switch (activeTab) {
        case 'home': return <ResidentHome onNavigate={pushScreen} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={() => setNotifications([])} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} categories={categories} />;
        case 'market': return <Marketplace onNavigate={pushScreen} onSelectCategory={navigateToCategory} services={professionalServices} products={products} />;
        case 'profile': return <ResidentProfile currentUser={currentUser} onNavigate={pushScreen} />;
        case 'acesso': return <AcessoPage onBack={goBack} accessList={accessList} onAddAccess={async (access) => {
          const { error } = await supabase.from('access_control').insert([{ resident_id: session.user.id, visitor_name: access.name, type: access.type, date: access.date, unit: currentUser?.unit, tower: currentUser?.tower, avatar_url: currentUser?.avatar }]);
          if (!error) refreshAppData();
        }} currentUser={currentUser} />;
        case 'financeiro': return <FinanceiroPage onBack={goBack} invoices={invoices} />;
        case 'chamado': return <ChamadosPage onBack={goBack} serviceRequests={serviceRequests} onAddRequest={handleAddServiceRequest} currentUser={currentUser} />;
        case 'condo-agenda': return <CondoAgendaPage onBack={goBack} reservations={reservations} onAddReservation={async (res) => {
          const insertData: any = {
            resident_id: session.user.id,
            area_id: res.areaId,
            area_name: res.area,
            date: res.date,
            status: 'confirmed',
            unit: currentUser?.unit,
            tower: currentUser?.tower
          };

          // Add time fields based on reservation type
          if (res.startTime && res.endTime) {
            insertData.start_time = res.startTime;
            insertData.end_time = res.endTime;
          } else if (res.timeSlot) {
            insertData.time_slot = res.timeSlot;
          }

          const { error } = await supabase.from('reservations').insert([insertData]);
          if (!error) { refreshAppData(); } else { throw new Error(error.message); }
        }} commonAreas={commonAreas} />;
        case 'desapego-detail': return <DesapegoDetailView item={selectedDesapego} onBack={goBack} currentUser={currentUser} onDelete={handleDeleteDesapego} />;
        case 'personal-data': return <PersonalDataPage onBack={goBack} currentUser={currentUser} />;
        case 'privacy': return <PrivacyPage onBack={goBack} />;
        case 'shop-detail': return <ShopDetailPage onBack={goBack} products={products} onSelectProduct={handleSelectProduct} categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />;
        case 'shop-product-detail': return <ProductDetailPage item={selectedProduct} onBack={goBack} />;
        case 'create-desapego': return <CreateDesapegoPage onBack={goBack} onAdd={handleAddDesapego} currentUser={currentUser} />;
        case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} onBack={goBack} onNavigate={pushScreen} onServiceRequest={handleAddServiceRequest} services={professionalServices} />;
        case 'desapego-full': return <DesapegoFullView onBack={goBack} desapegos={desapegos} currentUser={currentUser} onDelete={handleDeleteDesapego} onSelect={handleSelectDesapego} />;
        default: return <ResidentHome onNavigate={pushScreen} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={[]} onClearNotifications={() => { }} onSelectDesapego={() => { }} products={products} onSelectProduct={() => { }} categories={categories} />;
      }
    }

    // --- PROFISSIONAL ---
    if (userRole === UserRole.PROFESSIONAL) {
      const completedServices = serviceRequests.filter(r => r.status === 'completed');
      switch (activeTab) {
        case 'dashboard': return <ProfessionalDashboard serviceRequests={serviceRequests.filter(r => r.status === 'pending')} activeServices={serviceRequests.filter(r => r.status === 'accepted')} completedServices={completedServices} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={pushScreen} />;
        case 'services': return <ProfessionalServices services={professionalServices.filter(s => s.provider_id === session?.user?.id)} onAddService={async (srv) => {
          const { error } = await supabase.from('professional_services').insert([{ provider_id: session.user.id, title: srv.title, category: srv.category, description: srv.desc, price_range: srv.price_range, active: true }]);
          if (!error) { alert('Serviço criado!'); refreshAppData(); } else alert(error.message);
        }} onDeleteService={async (id) => {
          const { error } = await supabase.from('professional_services').delete().eq('id', id);
          if (!error) refreshAppData();
        }} />;
        case 'agenda': return <ProfessionalAgenda activeServices={serviceRequests.filter(r => r.status === 'accepted')} onUpdateRequest={handleUpdateServiceRequest} />;
        case 'earnings': return <ProfessionalEarnings services={completedServices} />;
        case 'shop': return <ProfessionalShop products={products.filter(p => p.vendor_id === session?.user?.id)} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onToggleStatus={handleToggleProductStatus} />;
        case 'profile': return <ProfessionalProfileView currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />;
        default: return <ProfessionalDashboard serviceRequests={serviceRequests} activeServices={activeServices} onUpdateRequest={() => { }} currentUser={currentUser} onNavigate={pushScreen} />;
      }
    }

    // --- ADMIN ---
    if (userRole === UserRole.ADMIN) {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard onNavigate={pushScreen} />;
        case 'admin-residents': return <AdminResidents onBack={goBack} />;
        case 'admin-access': return <AdminAccess onBack={goBack} accessList={accessList} onCheckIn={refreshAppData} />;
        case 'admin-incidents': return <AdminIncidents onBack={goBack} serviceRequests={serviceRequests} onUpdateRequest={handleUpdateServiceRequest} />;
        case 'admin-reservations': return <AdminReservations onBack={goBack} reservations={reservations} setReservations={setReservations} commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={refreshAppData} />;
        case 'admin-categories': return <AdminCategories onBack={goBack} categories={categories} onRefresh={refreshAppData} />;
        default: return <AdminDashboard onNavigate={pushScreen} />;
      }
    }

    if (userRole === UserRole.SUPER_ADMIN) return <SuperAdmin onLogout={() => supabase.auth.signOut()} currentUser={currentUser} />;
    return null;
  };

  if (appState === 'splash') return <SplashScreen onFinish={() => { if (session && userRole) setAppState('main'); else setAppState('login'); }} />;

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (appState === 'login') return <LoginScreen onLogin={async (session) => {
    // If login component returns session, use it immediately
    const s = session || (await supabase.auth.getSession()).data.session;
    if (s) fetchUserProfile(s.user.id);
  }} onRegister={() => setAppState('roleSelection')} />;

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
