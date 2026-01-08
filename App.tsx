import React, { useState, useEffect } from 'react';
import { UserRole } from './types';
import { supabase } from './supabase';
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
  const [appState, setAppState] = useState<'splash' | 'login' | 'roleSelection' | 'registerResident' | 'registerProfessional' | 'main'>('splash');
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedDesapego, setSelectedDesapego] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // --- ESTADOS GLOBAIS ---
  const [packages, setPackages] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [serviceRequests, setServiceRequests] = useState<any[]>([]);
  const [activeServices, setActiveServices] = useState<any[]>([]);
  const [desapegos, setDesapegos] = useState<any[]>([
    { id: '1', name: 'Bicicleta Caloi Aro 29', price: 'R$ 850', img: 'https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=2070&auto=format&fit=crop', user: 'Marcos (Torre A - 302)', status: 'VENDENDO', tower: 'Torre A', desc: 'Bicicleta em ótimo estado, com câmbio Shimano.' },
    { id: '2', name: 'Sofá Retrátil 3 Lugares', price: 'R$ 1.200', img: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop', user: 'Ana (Torre B - 104)', status: 'VENDENDO', tower: 'Torre B', desc: 'Sofá muito confortável, cor cinza, sem manchas.' },
    { id: '3', name: 'Violão Yamaha C40', price: 'R$ 400', img: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=2070&auto=format&fit=crop', user: 'Pedro (Torre A - 505)', status: 'NEGOCIANDO', tower: 'Torre A', desc: 'Violão clássico, ideal para iniciantes.' },
    { id: '4', name: 'Microondas Electrolux', price: 'R$ 350', img: 'https://plus.unsplash.com/premium_photo-1664372531393-27fe4842d0f0?q=80&w=2070&auto=format&fit=crop', user: 'Carla (Torre C - 201)', status: 'VENDENDO', tower: 'Torre C', desc: 'Microondas 127v, funcionando perfeitamente.' },
  ]);
  const [commonAreas, setCommonAreas] = useState<any[]>([]);
  const [professionalServices, setProfessionalServices] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [accessList, setAccessList] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // Dynamic Categories
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  // 1. ÚNICO LISTENER DE AUTENTICAÇÃO
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Removed timeout race condition to fix mobile persistence issues
        const { data: { session: currentSession } } = await supabase.auth.getSession();

        if (currentSession) {
          setSession(currentSession);
          await fetchUserProfile(currentSession.user.id);
          fetchCategories();
        } else {
          // Retry: Give auto-refresh a chance to work (1.5s grace period)
          await new Promise(r => setTimeout(r, 1500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();

          if (retrySession) {
            setSession(retrySession);
            await fetchUserProfile(retrySession.user.id);
            fetchCategories();
          } else {
            setAppState('login');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        setAppState('login');
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === 'SIGNED_OUT') {
        setSession(null);
        setUserRole(null);
        setCurrentUser(null);
        setAppState('login');
        setLoading(false);
      } else if (newSession) {
        setSession(newSession);
        await fetchUserProfile(newSession.user.id);
        fetchCategories();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*, profiles(name)').order('created_at', { ascending: false });
    if (data) setProducts(data);
  };

  const fetchDesapegos = async () => {
    const { data } = await supabase.from('marketplace').select('*, profiles(name, unit, tower, phone)').order('created_at', { ascending: false });
    if (data) {
      // Map to frontend structure
      setDesapegos(data.map((item: any) => ({
        id: item.id,
        name: item.title,
        price: `R$ ${item.price.toFixed(2)}`,
        img: item.image_url,
        user: item.profiles?.name || 'Vizinho',
        tower: item.profiles ? `${item.profiles.tower} - ${item.profiles.unit}` : 'Residencial',
        phone: item.profiles?.phone, // Added phone
        status: item.status.toUpperCase(),
        desc: item.description
      })));
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
  };

  // 2. BUSCA DE PERFIL COM LÓGICA DE AUTO-REPARO
  const fetchUserProfile = async (userId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);
    // Timeout safeguard
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 3000));

    try {
      // 1. Fetch Profile ONLY (Safe - No Joins)
      const fetchProfileOp = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const { data: profile, error } = await Promise.race([fetchProfileOp, timeout]) as any;

      if (profile) {
        // 2. Try to fetch Condo Name separately
        let condoName = 'Splendido Residencial';
        if (profile.condominium_id) {
          try {
            // Short timeout for condo name
            const condoTimeout = new Promise((_, r) => setTimeout(() => r(new Error('Condo timeout')), 2000));
            const fetchCondoOp = supabase
              .from('condominiums')
              .select('name')
              .eq('id', profile.condominium_id)
              .maybeSingle();

            const { data: condo } = await Promise.race([fetchCondoOp, condoTimeout]) as any;
            if (condo) condoName = condo.name;
          } catch (e) {
            console.warn('Failed to load condo name', e);
          }
        }

        const role = profile.role as UserRole;
        setUserRole(role);
        setCurrentUser({
          ...profile,
          avatar: profile.avatar || `https://picsum.photos/seed/${profile.name}/150`,
          condo: condoName
        });
        setAppState('main');
        setActiveTab(role === UserRole.RESIDENT ? 'home' : 'dashboard');
      } else {
        // Profile not found -> New user, go to Role Selection
        setAppState('roleSelection');
      }
    } catch (err) {
      console.error('Erro ao buscar perfil:', err);
      // Fallback for timeout/offline to prevent login loop
      setUserRole(UserRole.RESIDENT);
      setCurrentUser({
        id: userId,
        name: 'Bem-vindo!',
        condo: 'Carregando...',
        unit: '...',
        tower: '...',
        email: '',
        phone: '',
        photo: '',
        role: 'resident',
        created_at: ''
      } as any);
      setAppState('main');
      setActiveTab('home');
      if (!isSilent) setLoading(false);
    } finally {
      if (!isSilent) setLoading(false);
    }
  };

  // 4. SILENT RETRY LOGIC (Auto-Repair)
  useEffect(() => {
    if (currentUser?.name === 'Bem-vindo!' && session?.user?.id) {
      console.log('Triggering silent profile refresh...');
      const timer = setTimeout(() => {
        fetchUserProfile(session.user.id, true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser]);

  // 3. CARREGAMENTO DE DADOS (Apenas quando estiver no App)
  useEffect(() => {
    if (appState === 'main' && session) {
      fetchCommonAreas();
      fetchReservations();
      fetchServiceRequests();
      fetchServiceRequests();
      fetchProfessionalServices();
      fetchAccessList();
      fetchProducts();
      fetchDesapegos();
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
    const { data } = await supabase.from('service_requests').select('*, profiles(name, phone)').order('created_at', { ascending: false });
    if (data) {
      setServiceRequests(data.map((item: any) => ({
        ...item,
        user: item.profiles?.name || 'Morador',
        phone: item.profiles?.phone // Added phone
      })));
    }
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
    if (session && userRole) setAppState('main');
    else setAppState('login');
  };

  const navigateToCategory = (category: string) => {
    setSelectedCategory(category);
    setActiveTab('shop-detail');
  };

  const handleSelectDesapego = (item: any) => {
    setSelectedDesapego(item);
    setActiveTab('desapego-detail');
  };

  const handleSelectProduct = (item: any) => {
    setSelectedProduct(item);
    setActiveTab('shop-product-detail');
  };

  const renderContent = () => {
    if (!userRole || !currentUser) return null;

    // NOVO: Handlers de Produtos (Mini-Ecommerce)
    // NOVO: Handlers de Produtos (Mini-Ecommerce)
    // NOVO: Handlers de Produtos (Mini-Ecommerce)
    const handleAddProduct = async (product: any) => {
      if (!session?.user) return;

      let finalImageUrl = product.image_url;

      // Handle Image Upload if file exists
      if (product.image_file) {
        const file = product.image_file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, file);

        if (uploadError) {
          alert('Erro ao fazer upload da imagem: ' + uploadError.message);
          return;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(filePath);

        finalImageUrl = publicUrl;
      }

      // Remove the file object before sending to DB
      const { image_file, ...productData } = product;

      const { error } = await supabase.from('products').insert([{
        ...productData,
        image_url: finalImageUrl,
        vendor_id: session.user.id
      }]);

      if (error) {
        alert('Erro ao criar produto: ' + error.message);
      } else {
        fetchProducts();
      }
    };

    const handleDeleteProduct = async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) fetchProducts();
    };

    const handleToggleProductStatus = async (product: any) => {
      const { error } = await supabase.from('products').update({ available: !product.available }).eq('id', product.id);
      if (!error) fetchProducts();
    };

    const handleAddDesapego = async (item: any) => {
      if (!session?.user) return;

      let finalImageUrl = item.img;

      if (item.image_file) {
        const file = item.image_file;
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${session.user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('marketplace')
          .upload(filePath, file);

        if (uploadError) {
          alert('Erro ao fazer upload da imagem: ' + uploadError.message);
          return;
        }

        const { data } = supabase.storage
          .from('marketplace')
          .getPublicUrl(filePath);

        finalImageUrl = data.publicUrl;
      }

      const { error } = await supabase.from('marketplace').insert([{
        seller_id: session.user.id,
        title: item.name,
        price: parseFloat(item.price.replace('R$', '').replace(',', '.').trim()),
        status: item.status,
        description: item.desc,
        image_url: finalImageUrl
      }]);
      if (error) {
        alert('Erro ao criar desapego: ' + error.message);
      } else {
        fetchDesapegos();
      }
    };

    const handleDeleteDesapego = async (id: string) => {
      const { error } = await supabase.from('marketplace').delete().eq('id', id);
      if (error) alert('Erro ao excluir anúncio: ' + error.message);
      else {
        alert('Anúncio removido!');
        fetchDesapegos();
        setActiveTab('home');
      }
    };

    // --- CRITICAL LAUNCH HANDLERS ---
    const handleAddReservation = async (reservation: any) => {
      if (!session?.user) return;
      const { error } = await supabase.from('reservations').insert([{
        resident_id: session.user.id,
        area_id: reservation.areaId,
        area_name: reservation.area,
        date: reservation.date,
        unit: currentUser?.unit,
        tower: currentUser?.tower
      }]);
      if (error) alert('Erro ao reservar: ' + error.message);
      else {
        alert('Reserva confirmada com sucesso!');
        fetchReservations();
      }
    };

    const handleAddAccess = async (access: any) => {
      if (!session?.user) return;
      const { error } = await supabase.from('access_control').insert([{
        resident_id: session.user.id,
        visitor_name: access.name,
        type: access.type,
        date: access.date,
        unit: currentUser?.unit,
        tower: currentUser?.tower,
        avatar_url: currentUser?.avatar
      }]);
      if (error) alert('Erro ao autorizar acesso: ' + error.message);
      else {
        fetchAccessList();
      }
    };

    const handleAddServiceRequest = async (req: any) => {
      if (!session?.user) return;
      const { error } = await supabase.from('service_requests').insert([{
        resident_id: session.user.id,
        title: req.title || req.name,
        category: req.category || 'Solicitação',
        description: req.description || req.name,
        status: 'Aberto',
        unit: currentUser?.unit,
        location: `${currentUser?.tower} - ${currentUser?.unit}`,
        professional_id: req.professional_id // Optional
      }]);
      if (error) alert('Erro ao abrir chamado: ' + error.message);
      else {
        alert(req.category === 'Solicitação' ? 'Solicitação enviada!' : 'Chamado aberto com sucesso!');
        fetchServiceRequests();
      }
    };

    if (userRole === UserRole.RESIDENT) {
      switch (activeTab) {
        case 'home': return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={() => setNotifications([])} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} categories={categories} />;
        case 'market': return <Marketplace onNavigate={setActiveTab} onSelectCategory={navigateToCategory} services={professionalServices} products={products} />;
        case 'booking': return <ResidentBookings onBack={() => setActiveTab('home')} reservations={reservations} />;
        case 'profile': return <ResidentProfile currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'personal-data': return <PersonalDataPage onBack={() => setActiveTab('profile')} currentUser={currentUser} />;
        case 'privacy': return <PrivacyPage onBack={() => setActiveTab('profile')} />;
        case 'acesso': return <AcessoPage onBack={() => setActiveTab('home')} accessList={accessList} onAddAccess={handleAddAccess} currentUser={currentUser} />;
        case 'financeiro': return <FinanceiroPage onBack={() => setActiveTab('home')} invoices={invoices} />;
        case 'chamado': return <ChamadosPage onBack={() => setActiveTab('home')} serviceRequests={serviceRequests} onAddRequest={handleAddServiceRequest} currentUser={currentUser} />;
        case 'condo-agenda': return <CondoAgendaPage onBack={() => setActiveTab('home')} reservations={reservations} onAddReservation={handleAddReservation} commonAreas={commonAreas} />;
        case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} onBack={() => setActiveTab('market')} onNavigate={setActiveTab} onServiceRequest={handleAddServiceRequest} services={professionalServices} />;
        case 'desapego-full': return <DesapegoFullView onBack={() => setActiveTab('home')} desapegos={desapegos} currentUser={currentUser} onDelete={handleDeleteDesapego} onSelect={handleSelectDesapego} />;
        case 'desapego-detail': return <DesapegoDetailView onBack={() => setActiveTab('home')} item={selectedDesapego} currentUser={currentUser} onDelete={handleDeleteDesapego} />;
        case 'desapego-detail': return <DesapegoDetailView onBack={() => setActiveTab('home')} item={selectedDesapego} currentUser={currentUser} onDelete={handleDeleteDesapego} />;
        case 'shop-detail': return <ShopDetailPage onBack={() => setActiveTab('home')} products={products} onSelectProduct={handleSelectProduct} categories={categories} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} />;
        case 'shop-product-detail': return <ProductDetailPage item={selectedProduct} onBack={() => setActiveTab('shop-detail')} />;
        case 'create-desapego': return <CreateDesapegoPage onBack={() => setActiveTab('home')} onAdd={handleAddDesapego} currentUser={currentUser} />;
        default: return <ResidentHome onNavigate={setActiveTab} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} serviceRequests={serviceRequests} activeServices={activeServices} currentUser={currentUser} notifications={notifications} onClearNotifications={() => { }} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} categories={categories} />;
      }
    }

    if (userRole === UserRole.PROFESSIONAL) {
      switch (activeTab) {
        case 'dashboard': return <ProfessionalDashboard serviceRequests={serviceRequests.filter(r => r.status === 'pending')} activeServices={serviceRequests.filter(r => r.status === 'accepted')} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={setActiveTab} />;
        case 'agenda': return <ProfessionalAgenda activeServices={serviceRequests.filter(r => r.status === 'accepted')} />;
        case 'shop': return <ProfessionalShop products={products.filter(p => p.vendor_id === session?.user?.id)} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} onToggleStatus={handleToggleProductStatus} />;
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
        case 'admin-categories': return <AdminCategories onBack={() => setActiveTab('dashboard')} categories={categories} onRefresh={fetchCategories} />;
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
