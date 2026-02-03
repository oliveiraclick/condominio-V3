import React, { useState, useEffect, useRef } from 'react';
import {
    LayoutGrid, ShoppingBag, Plus, CalendarDays, User,
    Bell, Search, MapPin, Star, Key, Zap, CreditCard,
    MessageSquare, Sparkles, Package, Leaf, Droplets, Wrench, Monitor, Scissors, Briefcase,
    BookOpen, Utensils, QrCode, Megaphone, ChevronLeft, ChevronRight, Hammer, Clapperboard,
    Gem, AlertTriangle, Home
} from 'lucide-react';
import { Card } from '../components/ui';
import { AppFeedbackModal } from '../components/AppFeedbackModal';
// Imports from original Resident file to preserve functionality
import { ProfessionalDetailModal, ReviewModal, MuralDemandModal, DigitalIDModal, AuthorizationModal, BannerCarousel, NotificationsModal } from './Resident';
import { NewsTicker } from '../components/NewsTicker';
import { SpaceReservationFlow } from '../components/SpaceReservationFlow';
import { supabase } from '../supabase';
import { ResidentPackageConfirmation } from '../components/ResidentPackageConfirmation';

// --- NEW COMPONENT: Horizontal Product Card (E-Shop) ---
const EShopCard: React.FC<{ title: string; category: string; price: string; image?: string; onClick: () => void }> = ({ title, category, price, image, onClick }) => (
    <div onClick={onClick} className="min-w-[160px] max-w-[160px] bg-white rounded-3xl p-3 cursor-pointer group active:scale-95 transition-all hover:shadow-lg flex flex-col gap-3">
        <div className="h-40 bg-slate-100 rounded-2xl relative overflow-hidden">
            {image ? (
                <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <ShoppingBag size={32} />
                </div>
            )}
        </div>
        <div>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">{category}</p>
            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-2 line-clamp-2">{title}</h4>
            <span className="text-brand-primary font-bold text-sm block">{price}</span>
        </div>
    </div>
);

// --- NEW COMPONENT: Vitrine Desapega Card ---
const DesapegaCard: React.FC<{ title: string; location: string; price: string; image?: string; onClick: () => void }> = ({ title, location, price, image, onClick }) => (
    <div onClick={onClick} className="min-w-[220px] max-w-[220px] bg-white rounded-3xl overflow-hidden cursor-pointer group active:scale-95 transition-all hover:shadow-lg">
        <div className="h-32 bg-slate-100 relative overflow-hidden">
            {image ? (
                <img src={image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={title} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Package size={32} />
                </div>
            )}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                <MapPin size={10} className="text-slate-800" />
                <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wide">{location}</span>
            </div>
        </div>
        <div className="p-4">
            <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 truncate">{title}</h4>
            <span className="text-brand-primary font-bold text-sm block">{price}</span>
        </div>
    </div>
);

// --- NEW COMPONENT: Simple Hero Carousel ---
// --- NEW COMPONENT: Simple Hero Carousel ---
const SimpleCarousel: React.FC<{ items: any[]; onAction: () => void }> = ({ items, onAction }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Auto-rotation
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev === items.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length]);

    const currentItem = items[currentIndex];

    // If no items, fallback to default "Pool Party" image only
    if (!items || items.length === 0) {
        return (
            <div onClick={onAction} className="w-full bg-[#7C3AED] rounded-none p-0 relative overflow-hidden shadow-xl group cursor-pointer active:scale-[0.98] transition-all min-h-[320px] flex flex-col justify-end">
                {/* Image Background */}
                <div className="absolute inset-0 z-0">
                    <img src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800" className="w-full h-full object-cover" />
                </div>
            </div>
        )
    }

    // MODIFIED: rounded-none and no subtle shadow, just full width image
    return (
        <div className="relative w-full rounded-none overflow-hidden shadow-xl min-h-[320px] group">
            {/* Slides */}
            <div className="absolute inset-0 transition-all duration-700 ease-in-out">
                <img src={currentItem.image} className="w-full h-full object-cover" />
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {items.map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-white shadow-sm' : 'w-1.5 bg-white/40'}`} />
                ))}
            </div>
        </div>
    );
}

export const ResidentModern: React.FC<{
    currentUser: any;
    onNavigate: (target: string) => void;
    onSelectCategory: (cat: string, search?: string) => void;
    packages: any[];
    desapegos: any[];
    notifications?: any[];
    products?: any[];
    onSelectDesapego?: (item: any) => void;
    onSelectProduct?: (item: any) => void;
    onSitePros?: any[];
    onPostMuralDemand: (category: string, description: string) => void;
    muralCategories: string[];
    activeTab?: string;
    onClearNotifications?: () => void;
    onNotifications?: () => void;
}> = ({
    currentUser, onNavigate, onSelectCategory, packages = [], desapegos = [],
    notifications = [], products = [], onSelectDesapego, onSelectProduct,
    onSitePros = [], onPostMuralDemand, muralCategories, activeTab, onClearNotifications, onNotifications
}) => {
        const [search, setSearch] = useState('');
        const [feedbackOpen, setFeedbackOpen] = useState(false);
        const [reservationOpen, setReservationOpen] = useState(false);

        // Feature States
        const [selectedPro, setSelectedPro] = useState<any>(null);
        const [muralOpen, setMuralOpen] = useState(false);
        const [digitalIdOpen, setDigitalIdOpen] = useState(false);
        const [authModalOpen, setAuthModalOpen] = useState(false);

        // Scroll Refs
        const eShopScrollRef = useRef<HTMLDivElement>(null);
        const desapegoScrollRef = useRef<HTMLDivElement>(null);

        // Derived State
        const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
        const myPackages = packages.filter(p => p.unit === (currentUser?.unit || '') || p.resident_id === currentUser?.id);
        const hasPackages = myPackages.length > 0;
        const pendingHandshake = myPackages.some(p => p.status === 'awaiting_confirmation');

        const handleScroll = (ref: React.RefObject<HTMLDivElement>, direction: 'left' | 'right') => {
            if (ref.current) {
                const scrollAmount = 240;
                ref.current.scrollBy({
                    left: direction === 'left' ? -scrollAmount : scrollAmount,
                    behavior: 'smooth'
                });
            }
        };

        const handleSearch = (e: any) => {
            if (e.key === 'Enter' && search.trim()) {
                onSelectCategory('Todos', search.trim());
            }
        };

        // --- PACKAGE CONFIRMATION LOGIC ---
        const [pendingRequest, setPendingRequest] = useState<any>(null);
        const [confirmOpen, setConfirmOpen] = useState(false);

        useEffect(() => {
            if (currentUser?.id) {
                const fetchPending = async () => {
                    const { data } = await supabase
                        .from('package_pickup_requests')
                        .select('*')
                        .eq('resident_id', currentUser.id)
                        .eq('status', 'pending')
                        .maybeSingle();
                    if (data) setPendingRequest(data);
                    else setPendingRequest(null);
                }
                fetchPending();
                const channel = supabase.channel(`pickup_requests_${currentUser.id}`).on('postgres_changes', { event: '*', schema: 'public', table: 'package_pickup_requests', filter: `resident_id=eq.${currentUser.id}` }, () => fetchPending()).subscribe();
                return () => { supabase.removeChannel(channel); };
            }
        }, [currentUser?.id]);
        // ---------------------------------------

        // MOCK CAROUSEL DATA (Replace with real data later if needed)
        const carouselItems = [
            { id: 1, title: 'Pool Party de Verão', description: 'Participe da nossa festa na piscina com DJ e coquetéis.', image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800', tag: 'Evento Oficial', actionLabel: 'Confirmar Presença' },
            { id: 2, title: 'Feira Orgânica', description: 'Produtos frescos diretamente do produtor no salão de festas.', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800', tag: 'Hoje', actionLabel: 'Ver Produtos' },
        ];


        return (
            <div className="min-h-screen bg-slate-50 pb-28 font-sans md:max-w-md md:mx-auto">
                {/* 1. HEADER SPLENDIDO */}
                <header className="px-5 pt-12 pb-2 bg-slate-50 sticky top-0 z-40">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#7C3AED] rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
                                <Gem className="text-white fill-white" size={20} />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Splendido</h1>
                        </div>
                        <div className="flex gap-3">
                            <button onClick={() => setDigitalIdOpen(true)} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-[#7C3AED] shadow-sm active:scale-95 transition-transform border border-purple-100">
                                <QrCode size={20} />
                            </button>
                            <button onClick={onNotifications} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-800 shadow-sm active:scale-95 transition-transform border border-slate-100 relative">
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />}
                            </button>
                        </div>
                    </div>

                    <p className="text-slate-500 text-sm font-medium pl-1 mb-4">Olá, {currentUser?.name?.split(' ')[0]}</p>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            className="w-full h-14 pl-12 pr-4 bg-white rounded-2xl border-none text-slate-900 placeholder:text-slate-400 font-medium shadow-sm focus:ring-2 focus:ring-[#7C3AED]/20 transition-all outline-none"
                            placeholder="O que você precisa hoje?"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </header>

                <main>
                    {/* 2. TAB NAVIGATION (SEGMENTED CONTROL) */}
                    <div className="px-5 mt-4 mb-6">
                        <div className="flex p-1.5 bg-slate-200/50 rounded-xl">
                            <button
                                onClick={() => onSelectCategory('Todos')}
                                className="flex-1 bg-[#7C3AED] text-white shadow-md shadow-purple-200 rounded-lg py-3 text-[11px] font-bold uppercase tracking-widest transition-all active:scale-95"
                            >
                                Serviços
                            </button>
                            <button
                                onClick={() => onSelectCategory('Food')}
                                className="flex-1 text-slate-500 hover:text-slate-700 py-3 text-[11px] font-bold uppercase tracking-widest bg-transparent transition-colors"
                            >
                                Food
                            </button>
                            <button
                                onClick={() => setReservationOpen(true)}
                                className="flex-1 text-slate-500 hover:text-slate-700 py-3 text-[11px] font-bold uppercase tracking-widest bg-transparent transition-colors"
                            >
                                Entreterimento
                            </button>
                        </div>
                    </div>

                    {/* 3. HERO (CAROUSEL COM FOTO) - FULL WIDTH */}
                    <div className="mb-0">
                        {/* --- PENDING CONFIRMATION CARD (Injecting here if exists, high priority) --- */}
                        {pendingRequest && (
                            <div
                                onClick={() => setConfirmOpen(true)}
                                className="mx-5 bg-amber-100 border-l-4 border-amber-500 rounded-lg p-4 mb-4 shadow-sm flex items-center justify-between cursor-pointer animate-in fade-in"
                            >
                                <div>
                                    <h3 className="font-bold text-amber-900 text-sm">Encomendas para retirar</h3>
                                    <p className="text-xs text-amber-700">Confirme o recebimento agora.</p>
                                </div>
                                <ChevronRight className="text-amber-600" size={20} />
                            </div>
                        )}
                        {/* -------------------------------------------------------------------- */}

                        <SimpleCarousel items={carouselItems} onAction={() => setReservationOpen(true)} />
                    </div>

                    {/* 4. WARNING BANNER AS TICKER (YELLOW) */}
                    <div className="w-full mb-8">
                        <NewsTicker userRole="resident" variant="warning" />
                    </div>

                    {/* 5. E-SHOP SECTION */}
                    <div className="px-5 mb-10">
                        <div className="flex justify-between items-end mb-5">
                            <h3 className="font-bold text-xl text-slate-900">e-shop</h3>
                            <button onClick={() => onNavigate('shop-detail')} className="text-[#7C3AED] text-xs font-bold uppercase tracking-widest hover:text-purple-800">Ver tudo</button>
                        </div>

                        <div className="overflow-x-auto -mx-5 px-5 pb-4 flex gap-4 no-scrollbar touch-pan-x" ref={eShopScrollRef}>
                            {products && products.length > 0 ? products.slice(0, 5).map((prod, i) => (
                                <EShopCard
                                    key={i}
                                    title={prod.title}
                                    category={prod.category || 'Geral'}
                                    price={typeof prod.price === 'number' ? `R$ ${prod.price.toFixed(2)}` : prod.price}
                                    image={prod.image_url}
                                    onClick={() => onSelectProduct && onSelectProduct(prod)}
                                />
                            )) : (
                                // MOCK DATA FOR PREVIEW IF EMPTY
                                <>
                                    <EShopCard title="Água Perrier 330ml" category="Bebidas" price="R$ 12,90" image="https://images.unsplash.com/photo-1560023907-5f339617ea30?auto=format&fit=crop&q=80&w=300" onClick={() => { }} />
                                    <EShopCard title="Café Arabica Especial" category="Café" price="R$ 45,00" image="https://images.unsplash.com/photo-1559056199-6e3e1577e163?auto=format&fit=crop&q=80&w=300" onClick={() => { }} />
                                    <EShopCard title="Kit Churrasco Premium" category="Alimentos" price="R$ 129,90" image="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=300" onClick={() => { }} />
                                </>
                            )}
                        </div>
                    </div>

                    {/* 6. VITRINE DESAPEGA SECTION */}
                    <div className="px-5 mb-8">
                        <div className="flex justify-between items-end mb-5">
                            <h3 className="font-bold text-xl text-slate-900">Vitrine Desapega</h3>
                            <button onClick={() => onNavigate('desapegos-all')} className="text-[#7C3AED] text-xs font-bold uppercase tracking-widest hover:text-purple-800">Ver todos</button>
                        </div>

                        <div className="overflow-x-auto -mx-5 px-5 pb-4 flex gap-4 no-scrollbar touch-pan-x" ref={desapegoScrollRef}>
                            {desapegos && desapegos.length > 0 ? desapegos.map((item, i) => (
                                <DesapegaCard
                                    key={i}
                                    title={item.name || item.title}
                                    location={`${item.tower || 'Torre A'} - ${item.unit || '101'}`}
                                    price={item.price}
                                    image={item.img || item.image_url}
                                    onClick={() => onSelectDesapego && onSelectDesapego(item)}
                                />
                            )) : (
                                // MOCK DATA FOR PREVIEW IF EMPTY
                                <>
                                    <DesapegaCard title="Bicicleta Vintage" location="RUA 5" price="R$ 450,00" image="https://images.unsplash.com/photo-1485965120184-e224f723d6a9?auto=format&fit=crop&q=80&w=500" onClick={() => { }} />
                                    <DesapegaCard title="Guitarra Fender Usada" location="RUA 2" price="R$ 1.200,00" image="https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&q=80&w=500" onClick={() => { }} />
                                </>
                            )}
                        </div>
                    </div>

                </main>

                {/* --- MODALS --- */}
                <ProfessionalDetailModal isOpen={!!selectedPro} onClose={() => setSelectedPro(null)} professional={selectedPro} />
                <MuralDemandModal isOpen={muralOpen} onClose={() => setMuralOpen(false)} onPost={onPostMuralDemand} categories={muralCategories} />
                <DigitalIDModal isOpen={digitalIdOpen} onClose={() => setDigitalIdOpen(false)} currentUser={currentUser} onOpenAuth={() => setAuthModalOpen(true)} />
                <AuthorizationModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} currentUser={currentUser} />
                <AppFeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} currentUser={currentUser} userRole="resident" />
                <SpaceReservationFlow open={reservationOpen} onClose={() => setReservationOpen(false)} currentUserId={currentUser?.id} currentUser={currentUser} />
                <ResidentPackageConfirmation open={confirmOpen} onClose={() => setConfirmOpen(false)} residentId={currentUser?.id} />

            </div>
        );
    };
