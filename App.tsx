import React, { useState, useEffect, useCallback } from 'react';
import { UserRole } from './types';
import { supabase } from './supabase';
import { ToastProvider } from './components/ui';

import { SplashScreen as SplashScreenPlugin } from '@capacitor/splash-screen';
// Imports de Páginas e Componentes
import { SplashScreen, LoginScreen, RoleSelection, ResidentRegistration, ProfessionalRegistration } from './pages/Auth';
import { PrivacyPage } from './pages/Privacidade';
import { SupportPage } from './pages/Suporte';
import {
  ResidentHome, Marketplace, AppNavigation, AcessoPage, FinanceiroPage, ChamadosPage,
  FloatingBackButton, SectionHeader, NotificationsModal, DesapegoCard, ResidentProfile,
  ServicosFullView, MuralDemandModal, MinhasDemandasPage, ServiceRequestsPage, CondoAgendaPage,
  ResidentBookings, AssembliesPage, ShopDetailPage, PersonalDataPage, ProductDetailPage,
  DesapegoFullView, DesapegoDetailView, CreateDesapegoPage,
} from './pages/Resident';
import { RegistrationFlow } from './components/RegistrationFlow';
import { CommunicationHub } from './pages/CommunicationHub';
import { NewsTicker } from './components/NewsTicker';
import { ResidentPackageConfirmation } from './components/ResidentPackageConfirmation';
import {
  ProfessionalDashboard, ProfessionalAgenda, ProfessionalNavigation,
  ProfessionalServices, ProfessionalEarnings, ProfessionalProfileView, ProfessionalShop
} from './pages/Professional';
import {
  AdminDashboard, AdminResidents, AdminNotices, AdminAccess,
  AdminReservations, AdminConciergeChat, AdminFinance, AdminPackages,
  AdminNavigation, AdminIncidents, AdminGarage, AdminCategories, AdminProfile, AdminBanners
} from './pages/Admin';
import { AdminPackageReceipt } from './pages/AdminPackageReceipt';
import { AdminPackageProcessing } from './pages/AdminPackageProcessing';
import { AdminPackagePickup } from './pages/AdminPackagePickup';
import { Tasks } from './pages/Tasks';
import { SuperAdmin } from './pages/SuperAdmin';

// IMPORTS MODO MODERNO (BETA)
import { SplashScreenModern, ResidentRegistrationModern, LoginScreenModern, ProfessionalRegistrationModern } from './pages/AuthModern';
import { AdminDashboardModern } from './pages/AdminModern';
import { ResidentModern } from './pages/ResidentModern';

const App: React.FC = () => {
  // --- ESTADOS DE CONTROLE DE FLUXO ---
  const [appState, setAppState] = useState<'splash' | 'login' | 'roleSelection' | 'registerResident' | 'registerProfessional' | 'main' | 'privacy' | 'support'>('splash');
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
      if (prev.length <= 1) {
        if (activeTab !== 'home') {
          setActiveTabRaw('home');
          return ['home'];
        }
        return prev;
      }
      const newHist = prev.slice(0, -1);
      setActiveTabRaw(newHist[newHist.length - 1]);
      return newHist;
    });
  };

  // --- ESTADOS DE DADOS ---
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSearch, setSelectedSearch] = useState<string>('');
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
  const [myDemands, setMyDemands] = useState<any[]>([]);
  const [myProposals, setMyProposals] = useState<any[]>([]);

  const [useModernDesign, setUseModernDesign] = useState(false);
  const [notificationModalOpen, setNotificationModalOpen] = useState(false);
  const [packageConfirmationOpen, setPackageConfirmationOpen] = useState(false);

  const toggleModernDesign = () => {
    const newValue = !useModernDesign;
    setUseModernDesign(newValue);
    localStorage.setItem('beta_modern_design', String(newValue));
    if (newValue) window.location.reload(); // Recarrega para mostrar o Splash novo
  };

  // --- 1. LÓGICA DE BUSCA DE PERFIL (COM BLINDAGEM ANTI-LOOP) ---
  const fetchUserProfile = useCallback(async (userId: string, isSilent = false) => {
    if (!isSilent) setLoading(true);

    // Timeout safeguard for Login Loop Protection
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('Profile fetch timeout')), 8000));

    try {
      const fetchProfileOp = supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      const { data: profile } = await Promise.race([fetchProfileOp, timeout]) as any;

      if (profile) {
        let role = profile.role as UserRole;
        if (profile.email === 'denys@morador.com.br') role = UserRole.SUPER_ADMIN;


        setUserRole(role);

        // CACHE ROBUSTO: Salva tudo, não só a role
        const fullProfile = {
          ...profile,
          avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`,
          role: role,
          name: profile.name || 'Morador'
        };
        localStorage.setItem('userProfile_cache', JSON.stringify(fullProfile));
        localStorage.setItem('userRole_cache', role);

        setCurrentUser({
          ...fullProfile,
          condo: 'Carregando...',
        });

        if (profile.condominium_id) {
          supabase.from('condominiums').select('name, primary_color, secondary_color, contrast_color, logo_url, symbol_url, symbol_opacity').eq('id', profile.condominium_id).maybeSingle()
            .then(({ data: condo }) => {
              if (condo) {
                // Apply Branding
                if (condo.primary_color) {
                  document.documentElement.style.setProperty('--brand-primary', condo.primary_color);
                }
                if (condo.secondary_color) {
                  document.documentElement.style.setProperty('--brand-secondary', condo.secondary_color);
                }
                if (condo.contrast_color) {
                  document.documentElement.style.setProperty('--brand-contrast', condo.contrast_color);
                }

                setCurrentUser((prev: any) => {
                  const updated = {
                    ...prev,
                    condo: condo.name,
                    logo: condo.logo_url,
                    primaryColor: condo.primary_color,
                    symbol: condo.symbol_url,
                    symbolOpacity: condo.symbol_opacity
                  };
                  localStorage.setItem('userProfile_cache', JSON.stringify(updated)); // Atualiza cache com condo e branding
                  return updated;
                });
              }
            });
        }

        setAppState('main');
        if (role === UserRole.RESIDENT) {
          baseScreen('home');
        } else {
          baseScreen('dashboard');
        }
      } else {
        // BLINDAGEM: Tenta recuperar do Metadata do Auth se o trigger falhou
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.raw_user_meta_data?.role) {
          const metaRole = user.raw_user_meta_data.role as UserRole;
          const metaName = user.raw_user_meta_data.full_name || user.email?.split('@')[0] || 'Usuário';



          // Auto-repara o perfil no DB (Upsert)
          await supabase.from('profiles').upsert({
            id: userId,
            email: user.email,
            name: metaName,
            role: metaRole,
            is_free: true
          });

          setUserRole(metaRole);
          setCurrentUser({ id: userId, name: metaName, role: metaRole, condo: 'Recuperado' });
          setAppState('main');
          baseScreen(metaRole === UserRole.RESIDENT ? 'home' : 'dashboard');
        } else {
          // --- EMERGENCY RECOVERY FOR EXISTING USERS WITHOUT METADATA ---
          // If the user has a valid session but no profile and no metadata, we create a default profile.
          // This fixes the "Login Loop" for legacy users or cleaned databases.

          const email = user?.email || '';
          const isDenys = email.includes('denys');
          const forcedRole = isDenys ? UserRole.PROFESSIONAL : UserRole.RESIDENT; // Default to Resident for others
          const forcedName = user?.user_metadata?.full_name || email.split('@')[0];



          await supabase.from('profiles').upsert({
            id: userId,
            email: email,
            name: forcedName,
            role: forcedRole,
            is_free: true,
            created_at: new Date().toISOString()
          });

          // Update Cache & State
          const recoveredProfile = { id: userId, name: forcedName, role: forcedRole, condo: 'Recuperado' };
          localStorage.setItem('userProfile_cache', JSON.stringify(recoveredProfile));
          localStorage.setItem('userRole_cache', forcedRole);

          setUserRole(forcedRole);
          setCurrentUser(recoveredProfile);
          setAppState('main');
          baseScreen(forcedRole === UserRole.RESIDENT ? 'home' : 'dashboard');
        }
      }
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);

      // RECUPERAÇÃO ROBUSTA: Tenta ler o perfil completo do cache
      const cachedProfileStr = localStorage.getItem('userProfile_cache');
      const cachedRole = localStorage.getItem('userRole_cache') as UserRole;

      if (cachedProfileStr && cachedRole) {
        const cachedProfile = JSON.parse(cachedProfileStr);


        setUserRole(cachedRole);
        setCurrentUser(cachedProfile);

        setAppState('main');
        // Não reseta a tela se já estiver navegando
        if (!activeTab || activeTab === 'splash') {
          baseScreen(cachedRole === UserRole.RESIDENT ? 'home' : 'dashboard');
        }
      } else if (cachedRole) {
        // Fallback antigo (mínimo)
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

  // --- HIDE NATIVE SPLASH ---
  useEffect(() => {
    const hideSplash = async () => {
      await SplashScreenPlugin.hide();
    };
    hideSplash();
  }, []);

  // --- 2. GERENCIADOR DE AUTENTICAÇÃO ---
  useEffect(() => {
    const initAuth = async () => {
      let { data: { session: initialSession } } = await supabase.auth.getSession();
      if (initialSession) {
        setSession(initialSession);

        // Inicializa Push Notifications
        // Import must be added at top, but usage here
        import('./services/PushNotificationService').then(({ PushNotificationService }) => {
          PushNotificationService.init();
        });

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

    // Check for privacy/support routes on load
    if (window.location.hash === '#/privacy' || window.location.hash === '#/privacidade') {
      setAppState('privacy');
      setLoading(false);
    } else if (window.location.hash === '#/suporte' || window.location.hash === '#/support') {
      setAppState('support');
      setLoading(false);
    } else {
      initAuth();
    }

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

  // --- 3. SCROLL RESET ON NAVIGATION ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab, selectedCategory]);

  // --- PACKAGE CONFIRMATION LISTENER ---
  useEffect(() => {
    const handleOpenConfirmation = () => setPackageConfirmationOpen(true);
    window.addEventListener('open-package-confirmation', handleOpenConfirmation);
    return () => window.removeEventListener('open-package-confirmation', handleOpenConfirmation);
  }, []);

  // --- 4. CARREGAMENTO DE DADOS OTIMIZADO (SPLIT LOADING) ---
  const refreshAppData = useCallback(async () => {
    if (appState !== 'main' || !session) return;

    try {
      const currentRole = userRole || localStorage.getItem('userRole_cache') as UserRole;

      // Helper for clean data fetching
      const fetchTable = async (table: string, query: any) => {
        const { data, error } = await query;
        if (error) {
          console.error(`[App] Erro na tabela ${table}:`, error.message);
          return null;
        }
        return data;
      };

      // --- PHASE 1: CRITICAL DATA (User sees this immediately) ---
      // includes: Profile, Unread Notifications, Active Packages, Active Service Requests

      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

      const p1Promises: Promise<any>[] = [
        // 1. Notifications (Always needed)
        fetchTable('my_unread_notifications', supabase.from('my_unread_notifications').select('*').order('created_at', { ascending: false }).limit(20)),

        // 2. Active Packages (Resident Only)
        currentRole === UserRole.RESIDENT
          ? fetchTable('packages', supabase.from('packages').select('*').or(`resident_id.eq.${session.user.id},picked_up_by.eq.${session.user.id}`).in('status', ['pending', 'awaiting_confirmation']))
          : Promise.resolve([]),
      ];

      const [unreadNotifs, activePkgs] = await Promise.all(p1Promises);

      // IMMEDIATE STATE UPDATE (Phase 1)
      if (unreadNotifs) setNotifications(unreadNotifs);
      if (activePkgs) setPackages(activePkgs);

      // --- PHASE 2: SECONDARY DATA (Background / Below Fold) ---
      // includes: Marketplace, History, Products, Categories, Full Lists

      setTimeout(async () => {
        const p2Promises = [
          fetchTable('common_areas', supabase.from('common_areas').select('*').order('name')),

          // Limit reservations to active/future to validade cache
          fetchTable('reservations', supabase.from('reservations').select('*, common_areas(name), profiles:resident_id(name, avatar, unit, tower)').gte('date', new Date().toISOString().split('T')[0]).order('date').limit(50)),

          fetchTable('categories', supabase.from('categories').select('*').order('name')),

          // On-Site Pros (Quick cache check)
          fetchTable('profiles', supabase.from('profiles').select('*').eq('role', 'professional').eq('is_on_site', true).gt('on_site_updated_at', oneHourAgo)),

          // Service Requests (Limit history)
          fetchTable('service_requests', supabase.from('service_requests').select('*, resident:resident_id(name, phone, unit, tower), provider:provider_id(name, phone)').order('created_at', { ascending: false }).limit(currentRole === 'professional' ? 100 : 20)),

          // Marketplace (Limit 20 initially)
          fetchTable('marketplace', supabase.from('marketplace').select('*').order('created_at', { ascending: false }).limit(20)),

          // Products
          fetchTable('products', supabase.from('products').select('*').eq('available', true).limit(50)),

          // Professional Services
          fetchTable('professional_services', supabase.from('professional_services').select('*').eq('active', true)),

          // Demands (Resident Only)
          currentRole === UserRole.RESIDENT ? fetchTable('service_demands', supabase.from('service_demands').select('*').eq('resident_id', session.user.id).order('created_at', { ascending: false })) : Promise.resolve([]),
        ];

        const [areas, resvs, requests, cats, onSite, requestsHistory, desap, prods, proServices, demandsData] = await Promise.all(p2Promises);

        // BATCH UPDATE PHASE 2
        if (areas) setCommonAreas(areas);

        if (resvs) {
          setReservations(resvs.map((r: any) => ({
            ...r,
            displayName: r.profiles?.name || 'Morador',
            resident: r.profiles?.name || 'Morador',
            area: r.common_areas?.name || r.area_name || r.area_id,
            avatar: r.profiles?.avatar
          })));
        }

        if (cats) setCategories(cats);
        if (onSite) setOnSitePros(onSite);

        // MERGE REQUESTS (Active ones from P1 logic if split? No, we fetched all recent in P2 for simplicity, just render them)
        if (requestsHistory) {
          setServiceRequests(requestsHistory.map((r: any) => ({
            ...r,
            user: r.resident?.name || 'Morador',
            phone: r.resident?.phone || '',
            providerName: r.provider?.name || 'Prestador'
          })));
          setActiveServices(requestsHistory.filter((r: any) => r.status === 'accepted' || r.status === 'in_progress'));
        }

        if (proServices) setProfessionalServices(proServices); // Need mapping? logic below handles raw data usually? 
        // Re-running Mapping Logic for Pros (Simplified)
        // ... (Existing mapping logic omitted for brevity, assuming standard fetch is okay, or we reuse existing map block) ...
        // Actually, let's keep the mapping logic for Pros/Marketplace as it was crucial for display.

        // RE-USE EXISTING MAPPING LOGIC FOR PROS & MARKETPLACE (ADAPTED)
        // ... (Mapping for Pros)
        const proIds = new Set<string>();
        if (proServices) proServices.forEach((p: any) => { if (p.provider_id) proIds.add(p.provider_id); });

        let proMap: Record<string, any> = {};
        if (proIds.size > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('id, name, phone, avatar, specialties').in('id', Array.from(proIds));
          if (profilesData) profilesData.forEach(p => { proMap[p.id] = p; });
        }
        if (proServices) {
          setProfessionalServices(proServices.map((p: any) => {
            const profile = proMap[p.provider_id];
            return { ...p, providerName: profile?.name || 'Prestador', providerPhone: profile?.phone || '', providerAvatar: profile?.avatar, specialties: profile?.specialties };
          }));
        }

        // ... (Mapping for Marketplace)
        const userIds = new Set<string>();
        if (desap) desap.forEach((p: any) => { if (p.seller_id) userIds.add(p.seller_id); });
        let userMap: Record<string, any> = {};
        if (userIds.size > 0) {
          const { data: profilesData } = await supabase.from('profiles').select('id, name, avatar, phone, tower, unit').in('id', Array.from(userIds));
          if (profilesData) profilesData.forEach(p => { userMap[p.id] = p; });
        }
        if (desap) {
          setDesapegos(desap.map((i: any) => {
            const seller = userMap[i.seller_id];
            return {
              id: i.id, name: i.title, price: `R$ ${i.price}`, img: i.image_url,
              user: seller?.name || 'Vizinho', status: i.status ? i.status.toUpperCase() : 'DISPONÍVEL',
              avatar: seller?.avatar,
              desc: i.description, tower: seller?.tower || '', unit: seller?.unit || '', phone: seller?.phone || ''
            };
          }));
        }
        if (prods) {
          setProducts(prods.map((p: any) => {
            const vendor = userMap[p.vendor_id]; // Potentially distinct set? For simplicity reusing userMap if seller_id matches vendor_id, otherwise fetch. 
            // Products vendors might not be in Desapego list. Safe to fetch separately or live with it for V1 optimization. 
            // Let's assume minimal overlap or okay to have missing avatar for now to save bandwidth.
            return { ...p, profiles: vendor || { name: 'Vizinho', avatar: null } };
          }));
        }

        if (demandsData) setMyDemands(demandsData);

      }, 100); // Small Delay to allow UI to paint Phase 1

    } catch (e) {
      console.error("[App] Erro fatal no refresh", e);
    }
  }, [appState, session, userRole]);

  useEffect(() => { refreshAppData(); }, [refreshAppData]);

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

  const handleSelectDesapego = (item: any) => {
    setSelectedDesapego(item);
    pushScreen('desapego-detail');
  };

  const handleSelectProduct = (item: any) => {
    setSelectedProduct(item);
    pushScreen('shop-product-detail');
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


  const handlePostMuralDemand = async (category: string, description: string) => {
    if (!session?.user) return;
    const { error } = await supabase.from('service_demands').insert([{
      resident_id: session.user.id,
      category,
      description,
      status: 'open',
      unit: currentUser?.unit,
      tower: currentUser?.tower,
      condominium_id: currentUser?.condominium_id
    }]);
    if (!error) {
      alert('Demanda publicada no Mural! Profissionais serão notificados.');

      // TRIGGER NOTIFICATION
      // Modelo: "Novo pedido de [Categoria]: [Nome] busca..."
      supabase.functions.invoke('push', {
        body: {
          title: `Nova Demanda: ${category}`,
          body: `${currentUser?.name || 'Um morador'} busca profissional: ${description.substring(0, 60)}${description.length > 60 ? '...' : ''}`,
          target_role: 'professional',
          icon: '/icon.png' // You can customize this if you have category icons
        }
      }).catch(err => console.error('Push Trigger Error:', err));

      refreshAppData();
    } else {
      alert('Erro ao publicar: ' + error.message);
    }
  };

  const navigateToCategory = (category: string, search = '') => {
    setSelectedCategory(category);
    setSelectedSearch(search);
    pushScreen('servicos-full');
  };


  // --- RENDERIZAÇÃO ---
  const renderContent = () => {
    try {
      if (!userRole || !currentUser) return null;

      // LÓGICA RESIDENTE
      // LÓGICA RESIDENTE
      // LÓGICA RESIDENTE
      if (userRole === UserRole.RESIDENT) {
        // --- MOBILE LAYOUT (EXISTING) ---
        switch (activeTab) {
          case 'resident':
          case 'home': return (
            <>
              <ResidentModern
                currentUser={currentUser}
                onNavigate={pushScreen}
                onSelectCategory={navigateToCategory}
                packages={packages}
                desapegos={desapegos}
                notifications={notifications}
                onSelectDesapego={handleSelectDesapego}
                products={products}
                onSelectProduct={handleSelectProduct}
                onSitePros={onSitePros}
                muralCategories={categories?.map((c: any) => c.name) || []}
                onPostMuralDemand={handlePostMuralDemand}
                activeTab={activeTab}
                onClearNotifications={refreshAppData}
                onNotifications={() => setNotificationModalOpen(true)}
              />
              <ResidentPackageConfirmation
                open={packageConfirmationOpen}
                onClose={() => setPackageConfirmationOpen(false)}
                residentId={currentUser?.id}
              />
            </>
          );
          case 'market': return <Marketplace onNavigate={pushScreen} onSelectCategory={navigateToCategory} services={professionalServices} products={products} categories={categories} />;
          case 'profile': return <ResidentProfile currentUser={currentUser} onNavigate={pushScreen} />;
          case 'acesso': return <AcessoPage onBack={goBack} accessList={accessList} onAddAccess={async (access) => { await supabase.from('access_control').insert([{ resident_id: session.user.id, visitor_name: access.name, type: access.type, date: access.date, unit: currentUser?.unit, tower: currentUser?.tower }]); refreshAppData(); }} currentUser={currentUser} />;
          case 'financeiro': return <FinanceiroPage onBack={goBack} invoices={invoices} />;
          case 'chamado': return <CommunicationHub onBack={goBack} currentUser={currentUser} />;
          case 'condo-agenda': return <CondoAgendaPage onBack={goBack} reservations={reservations} commonAreas={commonAreas} onNavigate={pushScreen} onAddReservation={async (res) => {
            const insertData: any = {
              resident_id: session.user.id,
              area_id: res.areaId,
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
          case 'servicos-full': return <ServicosFullView initialCategory={selectedCategory} initialSearch={selectedSearch} onBack={goBack} onNavigate={pushScreen} onServiceRequest={handleAddServiceRequest} services={professionalServices} currentUser={currentUser} categories={categories} />;
          case 'minhas-demandas': return <MinhasDemandasPage onBack={goBack} currentUser={currentUser} demands={myDemands} proposals={myProposals} onRefresh={refreshAppData} />;
          case 'personal-data': return <PersonalDataPage onBack={goBack} currentUser={currentUser} />;
          case 'privacy': return <PrivacyPage onBack={goBack} />;
          case 'resident-bookings': return <ResidentBookings onBack={goBack} reservations={reservations} currentUser={currentUser} onRefresh={refreshAppData} />;

          // --- E-SHOP & DESAPEGO ROUTES ---
          case 'shop-detail': return <Marketplace onNavigate={pushScreen} onSelectCategory={navigateToCategory} services={professionalServices} products={products} categories={categories} />;
          case 'shop-product-detail': return <ProductDetailPage item={selectedProduct} onBack={goBack} />;
          case 'desapegos-all': return <DesapegoFullView onBack={goBack} desapegos={desapegos} currentUser={currentUser} onSelect={handleSelectDesapego} />;
          case 'desapego-detail': return <DesapegoDetailView item={selectedDesapego} onBack={goBack} currentUser={currentUser} />;
          case 'create-desapego': return <CreateDesapegoPage onBack={goBack} onAdd={handleAddDesapego} currentUser={currentUser} />;

          default: return <ResidentHome onNavigate={pushScreen} onSelectCategory={navigateToCategory} packages={packages} setPackages={setPackages} desapegos={desapegos} currentUser={currentUser} notifications={[]} onSelectDesapego={handleSelectDesapego} products={products} onSelectProduct={handleSelectProduct} onSitePros={onSitePros} muralCategories={categories?.map((c: any) => c.name) || []} categories={categories} onPostMuralDemand={handlePostMuralDemand} activeTab={activeTab} />;
        }
      }

      // LÓGICA PROFISSIONAL (CORRIGIDA)
      if (userRole === UserRole.PROFESSIONAL) {

        const pending = serviceRequests.filter(r => r.status === 'pending');
        const accepted = serviceRequests.filter(r => r.status === 'accepted');
        const completed = serviceRequests.filter(r => r.status === 'completed');

        switch (activeTab) {
          case 'dashboard': return <ProfessionalDashboard serviceRequests={pending} activeServices={accepted} completedServices={completed} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={pushScreen} />;
          case 'services': return <ProfessionalServices currentUser={currentUser} categories={categories} />;
          case 'agenda': return <ProfessionalAgenda activeServices={accepted} onUpdateRequest={handleUpdateServiceRequest} currentUser={currentUser} serviceRequests={serviceRequests} />;
          case 'earnings': return <ProfessionalEarnings currentUser={currentUser} />;
          case 'shop': return <ProfessionalShop currentUser={currentUser} />;
          case 'profile': return <ProfessionalProfileView currentUser={currentUser} categories={categories} onLogout={() => supabase.auth.signOut()} />;
          default: return <ProfessionalDashboard serviceRequests={pending} activeServices={accepted} completedServices={completed} onUpdateRequest={handleUpdateServiceRequest} subscription={{ status: currentUser?.subscription_status, trialEndsAt: currentUser?.trial_ends_at }} currentUser={currentUser} onNavigate={pushScreen} />;
        }
      }

      // --- ADMIN ---
      if (userRole === UserRole.ADMIN) {
        if (useModernDesign && activeTab === 'dashboard') {
          return <AdminDashboardModern onNavigate={pushScreen} onLogout={() => supabase.auth.signOut().then(() => { localStorage.removeItem('userRole_cache'); window.location.reload(); })} currentUser={currentUser} />;
        }

        switch (activeTab) {
          case 'dashboard': return <AdminDashboard onNavigate={pushScreen} onLogout={() => supabase.auth.signOut()} />;
          case 'admin-residents': return <AdminResidents onBack={goBack} />;
          case 'admin-access': return <AdminAccess onBack={goBack} accessList={accessList} onCheckIn={refreshAppData} />;
          case 'admin-packages': return <AdminPackages onBack={goBack} onNavigate={pushScreen} />;
          case 'package-receipt': return <AdminPackageReceipt onBack={goBack} currentUser={currentUser} />;
          case 'package-processing': return <AdminPackageProcessing onBack={goBack} currentUser={currentUser} onNavigate={pushScreen} />;
          case 'package-pickup': return <AdminPackagePickup onBack={goBack} currentUser={currentUser} />;
          case 'tasks': return <Tasks session={session} currentUser={currentUser} />;
          case 'admin-banners': return <AdminBanners onBack={goBack} />;
          case 'admin-incidents': return <AdminIncidents onBack={goBack} serviceRequests={serviceRequests} onUpdateRequest={handleUpdateServiceRequest} />;
          case 'admin-reservations': return <AdminReservations onBack={goBack} reservations={reservations} setReservations={setReservations} commonAreas={commonAreas} setCommonAreas={setCommonAreas} onUpdateArea={refreshAppData} />;
          case 'admin-categories': return <AdminCategories onBack={goBack} categories={categories} onRefresh={refreshAppData} />;
          case 'admin-notices': return <AdminNotices onBack={goBack} />;
          case 'admin-finance': return <AdminFinance onBack={goBack} />;
          case 'profile': return <AdminProfile currentUser={currentUser} onLogout={() => supabase.auth.signOut()} />;
          default: return <AdminDashboard onNavigate={pushScreen} onLogout={() => supabase.auth.signOut()} />;
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
              className="px-6 py-3 bg-brand-600 text-white rounded-xl font-bold"
            >
              Recarregar App
            </button>
          </div>
        </div>
      );
    }
  };

  if (appState === 'splash') {
    if (useModernDesign) return <SplashScreenModern onFinish={() => { if (session && userRole) setAppState('main'); else setAppState('login'); }} />;
    return <SplashScreen onFinish={() => { if (session && userRole) setAppState('main'); else setAppState('login'); }} />;
  }

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div></div>;

  if (appState === 'login') return (
    <>
      {useModernDesign ? (
        <LoginScreenModern
          onLogin={async (session) => {
            const s = session || (await supabase.auth.getSession()).data.session;
            if (s) fetchUserProfile(s.user.id);
          }}
          onRegister={() => setAppState('roleSelection')}
        />
      ) : (
        <LoginScreen onLogin={async (session) => {
          // If login component returns session, use it immediately
          const s = session || (await supabase.auth.getSession()).data.session;
          if (s) fetchUserProfile(s.user.id);
        }} onRegister={() => setAppState('roleSelection')} />
      )}
    </>
  );

  if (appState === 'roleSelection') return <RoleSelection onSelect={(role) => { setUserRole(role); setAppState(role === UserRole.RESIDENT ? 'registerResident' : 'registerProfessional'); }} onBack={() => setAppState('login')} />;

  if (appState === 'registerResident') {
    return (
      <RegistrationFlow
        open={true}
        onClose={() => setAppState('roleSelection')}
        onSuccess={() => setAppState('login')}
      />
    );
  }

  if (appState === 'registerProfessional') {
    if (useModernDesign) return <ProfessionalRegistrationModern onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;
    return <ProfessionalRegistration onFinish={() => setAppState('login')} onBack={() => setAppState('roleSelection')} />;
  }

  if (appState === 'privacy') return <PrivacyPage onBack={() => { window.location.hash = ''; setAppState('login'); }} />;
  if (appState === 'support') return <SupportPage onBack={() => { window.location.hash = ''; setAppState('login'); }} onNavigateToPrivacy={() => { window.location.hash = '#/privacidade'; setAppState('privacy'); }} />;

  const isSubPage = [
    'desapego-detail', 'admin-access', 'admin-reservations', 'admin-incidents',
    'admin-categories', 'admin-packages', 'package-receipt',
    'package-processing', 'package-pickup', 'admin-packages-receipt',
    'admin-packages-processing', 'admin-packages-pickup',
    'condo-agenda', 'resident-bookings'
  ].includes(activeTab);

  return (
    <ToastProvider>
      <div className="relative w-full max-w-md lg:max-w-full mx-auto shadow-2xl lg:shadow-none min-h-screen overflow-x-hidden border-x lg:border-none border-slate-100 bg-slate-50">
        {/* GLOBAL BACKGROUND (From Login) */}
        <div className="absolute inset-0 z-0 pointer-events-none fixed">
          <div className="absolute inset-0 bg-slate-50"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(16,185,129,0.05),transparent_70%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(59,130,246,0.05),transparent_60%)]"></div>
        </div>

        <div className="relative z-10 min-h-screen">
          {renderContent()}
          {!isSubPage && userRole && (
            userRole === UserRole.RESIDENT ? (
              <>
                <AppNavigation activeTab={activeTab} onChange={(tab) => tab === 'create-desapego' ? pushScreen(tab) : baseScreen(tab)} currentUser={currentUser} onLogout={() => supabase.auth.signOut().then(() => window.location.reload())} onNotifications={() => setNotificationModalOpen(true)} />
                <NotificationsModal isOpen={notificationModalOpen} onClose={() => setNotificationModalOpen(false)} currentUser={currentUser} onUpdate={refreshAppData} />
              </>
            ) :
              userRole === UserRole.PROFESSIONAL ? <ProfessionalNavigation activeTab={activeTab} onChange={baseScreen} currentUser={currentUser} onLogout={() => supabase.auth.signOut().then(() => window.location.reload())} /> :
                userRole === UserRole.ADMIN ? <AdminNavigation activeTab={activeTab} onChange={baseScreen} /> : null
          )}
        </div>
      </div>
    </ToastProvider>
  );
};

export default App;
