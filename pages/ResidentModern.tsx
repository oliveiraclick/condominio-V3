import React, { useState, useEffect } from 'react';
import {
    LayoutGrid, ShoppingBag, Plus, CalendarDays, User,
    Bell, Search, MapPin, ChevronRight, Star, Key, Zap, CreditCard,
    MessageSquare, Sparkles, Package, Leaf, Droplets, Wrench, Monitor, Scissors, Briefcase,
    BookOpen, Utensils, QrCode, Megaphone
} from 'lucide-react';
import { Card } from '../components/ui';
import { AppFeedbackModal } from '../components/AppFeedbackModal';
// Imports from original Resident file to preserve functionality
import { ProfessionalDetailModal, ReviewModal, MuralDemandModal, DigitalIDModal, AuthorizationModal, BannerCarousel, NotificationsModal } from './Resident';

// New Component: Service Category Item (Square)
const ServiceCategoryItem: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void; isNew?: boolean; className?: string; iconClassName?: string }> = ({ icon, label, onClick, isNew, className, iconClassName }) => (
    <div onClick={onClick} className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer group active:scale-95 transition-transform">
        <div className={`w-16 h-16 rounded-2xl shadow-sm border flex items-center justify-center transition-all relative group-hover:shadow-md group-hover:-translate-y-1 ${className || 'bg-white border-slate-100 text-slate-700'}`}>
            <div className={iconClassName}>{icon}</div>
            {isNew && <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>}
        </div>
        <span className="text-[10px] font-bold text-slate-600 text-center leading-tight max-w-[80px]">{label}</span>
    </div>
);



// New Component: Service Card (Horizontal)
const ServiceCard: React.FC<{ title: string; subtitle?: string; image?: string; onClick: () => void }> = ({ title, subtitle, image, onClick }) => (
    <div onClick={onClick} className="min-w-[160px] bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer group active:scale-95 transition-all hover:shadow-md">
        <div className="h-24 bg-slate-100 relative">
            {image ? (
                <img src={image} className="w-full h-full object-cover" alt={title} />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <User size={32} />
                </div>
            )}
        </div>
        <div className="p-3">
            <h4 className="font-bold text-slate-800 text-sm truncate">{title}</h4>
            {subtitle && <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>}
        </div>
    </div>
);

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
}> = ({
    currentUser, onNavigate, onSelectCategory, packages = [], desapegos = [],
    notifications = [], products = [], onSelectDesapego, onSelectProduct,
    onSitePros = [], onPostMuralDemand, muralCategories, activeTab, onClearNotifications, onNotifications
}) => {
        const [search, setSearch] = useState('');
        const [feedbackOpen, setFeedbackOpen] = useState(false);

        // Feature States
        const [selectedPro, setSelectedPro] = useState<any>(null);
        const [muralOpen, setMuralOpen] = useState(false);
        const [digitalIdOpen, setDigitalIdOpen] = useState(false);
        const [authModalOpen, setAuthModalOpen] = useState(false);
        const [notifsOpen, setNotifsOpen] = useState(false);

        // Derived State
        const unreadCount = notifications ? notifications.filter(n => !n.read).length : 0;
        const myPackages = packages.filter(p => p.unit === (currentUser?.unit || '') || p.resident_id === currentUser?.id);
        const hasPackages = myPackages.length > 0;
        const pendingHandshake = myPackages.some(p => p.status === 'awaiting_confirmation');

        // Auto-open logic removed per user request
        // useEffect(() => {
        //     if (pendingHandshake && !sessionStorage.getItem('hasSeenHandshakeRedesign')) {
        //         setDigitalIdOpen(true);
        //         sessionStorage.setItem('hasSeenHandshakeRedesign', 'true');
        //     }
        // }, [pendingHandshake]);

        const handleSearch = (e: any) => {
            if (e.key === 'Enter' && search.trim()) {
                onSelectCategory('Todos', search.trim());
            }
        };

        return (
            <div className="min-h-screen bg-slate-50 pb-32 font-sans md:max-w-md md:mx-auto">
                {/* 1. HEADER CLEAN */}
                <header className="px-6 pt-12 pb-6 bg-white shadow-sm sticky top-0 z-40 rounded-b-[32px]">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{currentUser?.condo || 'Condomínio'}</h1>
                            <p className="text-slate-500 text-sm font-medium">Olá, {currentUser?.name?.split(' ')[0]}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            {hasPackages && (
                                <button onClick={() => setDigitalIdOpen(true)} className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center text-brand-primary active:scale-90 transition-transform relative hover:bg-brand-100">
                                    <Package size={20} />
                                    {pendingHandshake && <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>}
                                </button>
                            )}
                            <button onClick={() => setDigitalIdOpen(true)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 active:scale-90 transition-transform hover:bg-slate-200">
                                <QrCode size={20} />
                            </button>
                            <button onClick={onNotifications} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 relative active:scale-90 transition-transform hover:bg-slate-200">
                                <Bell size={20} />
                                {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />}
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <button
                            onClick={() => search.trim() && onSelectCategory('Todos', search.trim())}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-primary transition-colors cursor-pointer hover:scale-110 active:scale-95"
                        >
                            <Search size={20} />
                        </button>
                        <input
                            className="w-full h-12 pl-12 pr-4 bg-slate-100 rounded-xl border-none text-slate-900 placeholder:text-slate-400 font-medium focus:ring-2 focus:ring-brand-primary transition-all outline-none"
                            placeholder="O que você precisa?"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={handleSearch}
                        />
                    </div>
                </header>

                <main className="p-6 space-y-8">
                    {/* 2. CATEGORIES CAROUSEL */}
                    <section>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar touch-pan-x">
                            <ServiceCategoryItem icon={<Droplets size={24} />} iconClassName="text-cyan-500" label="Encanador" onClick={() => onSelectCategory('Encanador')} />
                            <ServiceCategoryItem icon={<Zap size={24} />} iconClassName="text-yellow-500" label="Eletricista" onClick={() => onSelectCategory('Eletricista')} />
                            <ServiceCategoryItem icon={<Sparkles size={24} />} iconClassName="text-emerald-500" label="Limpeza" onClick={() => onSelectCategory('Limpeza')} />
                            <ServiceCategoryItem icon={<Leaf size={24} />} iconClassName="text-green-500" label="Jardim" onClick={() => onSelectCategory('Jardinagem')} />
                            <ServiceCategoryItem
                                icon={<CalendarDays size={24} className="stroke-brand-contrast" />}
                                label="Reservas"
                                className="bg-brand-gradient border-transparent text-brand-contrast shadow-brand-glow"
                                iconClassName="text-brand-contrast"
                                onClick={() => onNavigate('condo-agenda')}
                            />
                        </div>
                    </section>

                    {/* 2.5. BANNERS (Promotions & Notices) */}
                    <div className="px-1 -mb-2">
                        <BannerCarousel />
                    </div>

                    {/* NEW: MURAL DE OPORTUNIDADES BANNER */}
                    <div onClick={() => setMuralOpen(true)} className="w-full bg-brand-gradient-horizontal rounded-3xl p-5 shadow-xl shadow-brand-glow text-brand-contrast relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all group flex items-center justify-between mt-2">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                        <div className="relative z-10 flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/10">
                                <Megaphone size={24} className="text-brand-contrast" />
                            </div>
                            <div>
                                <h4 className="font-bold text-base text-brand-contrast italic uppercase tracking-tighter leading-none mb-1">Não achou o que precisa?</h4>
                                <p className="text-brand-contrast opacity-80 text-[10px] font-medium">Publique no Mural e receba propostas.</p>
                            </div>
                        </div>
                        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10">
                            <Plus size={18} className="text-brand-contrast" />
                        </div>
                    </div>

                    {/* 3. HERO BANNER (Compact Height) */}
                    <section>
                        <div onClick={() => onNavigate('market')} className="w-full bg-brand-gradient-horizontal rounded-3xl p-4 shadow-xl shadow-brand-glow text-white relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all group flex items-center justify-between">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-110 transition-transform duration-700"></div>

                            <div className="relative z-10">
                                <h4 className="font-bold text-lg text-brand-contrast italic uppercase tracking-tighter leading-none mb-1">e-Shop Vizinho</h4>
                                <p className="text-brand-contrast opacity-80 text-xs font-medium">Compre e venda no condomínio</p>
                            </div>

                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm relative z-10 shrink-0 ml-4">
                                <ChevronRight size={20} className="text-brand-contrast" />
                            </div>
                        </div>
                    </section>

                    {/* 4. SECTIONS (Scrollable Horizontal) */}

                    {/* On-Site Pros (Reformas e Reparos highlight) */}
                    {onSitePros.length > 0 && (
                        <section>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <h3 className="font-bold text-lg text-slate-800 tracking-tight">No Condomínio</h3>
                                </div>
                                <button onClick={() => onSelectCategory('Todos')} className="text-brand-primary text-xs font-bold uppercase tracking-widest hover:text-brand-700 transition-colors">Ver tudo</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar touch-pan-x">
                                {onSitePros.map((pro, i) => (
                                    <ServiceCard
                                        key={i}
                                        title={pro.name}
                                        subtitle={pro.category}
                                        image={pro.avatar}
                                        onClick={() => setSelectedPro(pro)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Marketplace Destaques */}
                    {products && products.length > 0 && (
                        <section>
                            <div className="flex justify-between items-center mb-4 px-1">
                                <h3 className="font-bold text-lg text-slate-800 tracking-tight">Vitrine e-Shop</h3>
                                <button onClick={() => onNavigate('shop-detail')} className="text-brand-primary text-xs font-bold uppercase tracking-widest hover:text-brand-700 transition-colors">Ver tudo</button>
                            </div>
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar touch-pan-x">
                                {products.slice(0, 5).map((prod, i) => (
                                    <ServiceCard
                                        key={i}
                                        title={prod.title}
                                        subtitle={typeof prod.price === 'number' ? `R$ ${prod.price.toFixed(2)}` : prod.price}
                                        image={prod.image_url}
                                        onClick={() => onSelectProduct && onSelectProduct(prod)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Mural do Desapego (Replacing Serviços Domésticos) */}
                    <section>
                        <div className="flex justify-between items-center mb-4 px-1">
                            <h3 className="font-bold text-lg text-slate-800 tracking-tight">Mural do Desapego</h3>
                            <button onClick={() => onNavigate('desapegos-all')} className="text-brand-primary text-xs font-bold uppercase tracking-widest hover:text-brand-700 transition-colors">Ver tudo</button>
                        </div>
                        {desapegos.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar touch-pan-x">
                                {desapegos.map((item, i) => (
                                    <ServiceCard
                                        key={i}
                                        title={item.name || item.title}
                                        subtitle={item.price}
                                        image={item.img || item.image_url}
                                        onClick={() => onSelectDesapego && onSelectDesapego(item)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                                <p className="text-slate-400 text-sm">Nenhum desapego anunciado ainda.</p>
                                <button onClick={() => onNavigate('create-desapego')} className="mt-2 text-brand-primary font-bold text-xs uppercase tracking-widest">Anunciar Agora</button>
                            </div>
                        )}
                    </section>

                    {/* Feedback Trigger (Bottom) */}
                    <div className="pt-4">
                        <Card
                            onClick={() => setFeedbackOpen(true)}
                            className="bg-brand-gradient-horizontal text-brand-contrast p-6 rounded-[24px] relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all group border-none shadow-xl shadow-brand-glow"
                        >
                            <div className="relative z-10 flex gap-4 items-center">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-brand-contrast group-hover:scale-110 transition-transform">
                                    <Sparkles size={24} className="stroke-brand-contrast" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-none mb-1 text-brand-contrast">Sugestões?</h4>
                                    <p className="text-brand-contrast opacity-80 text-xs font-medium">Ajude a melhorar o app.</p>
                                </div>
                            </div>
                            {/* Decorative background element */}
                            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
                        </Card>
                    </div>

                </main>

                {/* --- MODALS --- */}

                <ProfessionalDetailModal
                    isOpen={!!selectedPro}
                    onClose={() => setSelectedPro(null)}
                    professional={selectedPro}
                />

                <MuralDemandModal
                    isOpen={muralOpen}
                    onClose={() => setMuralOpen(false)}
                    onPost={onPostMuralDemand}
                    categories={muralCategories}
                />

                <DigitalIDModal
                    isOpen={digitalIdOpen}
                    onClose={() => setDigitalIdOpen(false)}
                    currentUser={currentUser}
                    onOpenAuth={() => setAuthModalOpen(true)}
                />

                <AuthorizationModal
                    isOpen={authModalOpen}
                    onClose={() => setAuthModalOpen(false)}
                    currentUser={currentUser}
                />

                <AppFeedbackModal
                    isOpen={feedbackOpen}
                    onClose={() => setFeedbackOpen(false)}
                    currentUser={currentUser}
                    userRole="resident"
                />

            </div>
        );
    };
