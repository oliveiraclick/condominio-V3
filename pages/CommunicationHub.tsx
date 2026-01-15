import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Package, MessageSquare, Send, Check, Search, Shield, User, Clock, ChevronRight, Bell } from 'lucide-react';
import { Card, Badge, Button, Input } from '../components/ui';
import { supabase } from '../supabase';

// Helper for formatting time
const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

export const CommunicationHub: React.FC<{ onBack: () => void; currentUser: any }> = ({ onBack, currentUser }) => {
    const [view, setView] = useState<'hub' | 'chat' | 'deliveries'>('hub');
    const [activeChannel, setActiveChannel] = useState<any>(null); // For chat
    const [channels, setChannels] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [packages, setPackages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Load
    useEffect(() => {
        fetchPackages();
        fetchChannels();
    }, []);

    // Scroll to bottom on new message
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Real-time subscriptions could be added here

    const fetchPackages = async () => {
        if (!currentUser) return;
        try {
            // Fetch packages for this user/unit
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .or(`resident_id.eq.${currentUser.id},unit.eq.${currentUser.unit}`)
                .order('received_at', { ascending: false });

            if (data) setPackages(data);
        } catch (error) {
            console.error('Error fetching packages', error);
            // Fallback for demo/no-backend
            setPackages([
                { id: '1', description: 'Encomenda Amazon', received_at: new Date().toISOString(), status: 'available', received_by: 'Portaria' }
            ]);
        }
    };

    const fetchChannels = async () => {
        if (!currentUser) return;
        try {
            // Fetch or Create default channels if they don't exist
            // For now, we simulate 2 main channels: ADM and Portaria
            const defaultChannels = [
                { id: 'adm', type: 'support', name: 'Administração', icon: <Shield size={20} />, lastMessage: 'Olá, como podemos ajudar?', time: '10:00' },
                { id: 'concierge', type: 'concierge', name: 'Portaria', icon: <User size={20} />, lastMessage: 'Sua encomenda chegou.', time: '09:30' }
            ];
            setChannels(defaultChannels);
        } catch (error) {
            console.error("Error fetching channels", error);
        }
    };

    const openChat = async (channel: any) => {
        setActiveChannel(channel);
        setView('chat');
        // Fetch messages for this channel
        // meaningful delay to simulate fetch
        setLoading(true);
        setTimeout(() => {
            setMessages([
                { id: 1, text: 'Olá, bom dia!', sender: 'them', time: '10:00' },
                { id: 2, text: channel.lastMessage, sender: 'them', time: channel.time }
            ]);
            setLoading(false);
        }, 500);
    };

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const msg = {
            id: Date.now(),
            text: newMessage,
            sender: 'me',
            time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        setMessages([...messages, msg]);
        setNewMessage('');

        // Here we would push to DB
    };

    const unreadPackages = packages.filter(p => p.status === 'available').length;

    // --- SUB-COMPONENTS RENDER ---

    if (view === 'chat' && activeChannel) {
        return (
            <div className="fixed inset-0 bg-[#efe7dd] z-50 flex flex-col h-[100dvh]">
                {/* WhatsApp Style Header */}
                <div className="bg-[#008069] p-4 pt-10 text-white flex items-center gap-3 shadow-md">
                    <button onClick={() => setView('hub')} className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-95 transition-all">
                        <ArrowLeft size={24} />
                    </button>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white/90">
                        {activeChannel.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-lg leading-tight">{activeChannel.name}</h3>
                        <p className="text-[11px] opacity-80">Online agora</p>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat bg-center">
                    <div className="flex justify-center my-4">
                        <span className="bg-[#e1f3fb] text-slate-500 text-[10px] px-3 py-1 rounded-lg uppercase font-bold shadow-sm">Hoje</span>
                    </div>

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[75%] p-3 rounded-2xl relative shadow-sm text-sm ${msg.sender === 'me'
                                ? 'bg-[#d9fdd3] text-slate-800 rounded-tr-none'
                                : 'bg-white text-slate-800 rounded-tl-none'
                                }`}>
                                <p className="leading-relaxed">{msg.text}</p>
                                <div className="text-[9px] text-zinc-400 text-right mt-1 flex items-center justify-end gap-1">
                                    {msg.time}
                                    {msg.sender === 'me' && <Check size={12} className="text-blue-500" />}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white flex items-center gap-2 pb-6 safe-area-bottom">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Mensagem"
                        className="flex-1 bg-white border-none rounded-full px-5 h-12 text-base focus:ring-0 shadow-sm"
                        style={{ backgroundColor: 'white' }}
                    />
                    <button
                        onClick={sendMessage}
                        className="w-12 h-12 bg-[#008069] rounded-full flex items-center justify-center text-white shadow-lg active:scale-90 transition-all"
                    >
                        <Send size={20} className="ml-1" />
                    </button>
                </div>
            </div>
        );
    }

    if (view === 'deliveries') {
        const availablePackages = packages.filter(p => p.status === 'available');
        const deliveredPackages = packages.filter(p => p.status === 'delivered');

        return (
            <div className="min-h-screen bg-[#fcfcfd] safe-area-bottom pb-10">
                <header className="p-6 pt-12 flex items-center gap-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40 shadow-sm">
                    <button onClick={() => setView('hub')} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center active:scale-90 transition-transform shadow-sm border border-slate-100"><ArrowLeft size={20} className="text-slate-600" /></button>
                    <div className="flex-1">
                        <h2 className="text-xl font-black italic uppercase text-slate-900 tracking-tighter">Encomendas</h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua logística pessoal</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 shadow-sm">
                        <Package size={22} />
                    </div>
                </header>

                <div className="p-6 space-y-8">
                    {/* Main Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-[#0a0a0b] text-white p-5 rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-lg shadow-black/10 active:scale-95 transition-all">
                            <span className="text-xl font-bold">+ Nova Encomenda</span>
                        </button>
                        <button className="bg-[#10b981] text-white p-5 rounded-[24px] flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                            <div className="flex items-center gap-2">
                                <Search size={20} className="stroke-[3]" />
                                <span className="text-xl font-bold uppercase italic">Entregar</span>
                            </div>
                        </button>
                    </div>

                    {/* Manage Link */}
                    <button className="w-full py-4 bg-white border border-slate-200 rounded-full text-slate-500 font-bold uppercase text-xs tracking-widest shadow-sm active:scale-[0.98] transition-all">
                        Ver todas / Gerenciar
                    </button>

                    {/* Aguardando Retirada (Receival History) */}
                    <section className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
                                Aguardando Retirada
                            </h3>
                            {availablePackages.length > 0 && <Badge className="bg-orange-100 text-orange-600 font-bold">{availablePackages.length}</Badge>}
                        </div>
                        {availablePackages.length === 0 ? (
                            <div className="bg-white p-12 rounded-[40px] border border-dashed border-slate-200 text-center shadow-inner">
                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 opacity-50">
                                    <Package className="text-slate-300" size={32} />
                                </div>
                                <p className="text-xs text-slate-400 font-bold italic tracking-wide uppercase">Tudo entregue no momento!</p>
                            </div>
                        ) : (
                            <div className="flex gap-4 overflow-x-auto pb-6 snap-x no-scrollbar -mx-2 px-2">
                                {availablePackages.map(pkg => (
                                    <div key={pkg.id} className="min-w-[88%] snap-center bg-gradient-to-br from-white to-slate-50 p-6 rounded-[40px] border border-white shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                        {/* Premium Reflective Background */}
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-bl-[80px] blur-2xl group-hover:scale-125 transition-transform duration-700" />
                                        <div className="absolute top-4 right-6">
                                            <Badge className="bg-orange-500 text-white border-0 shadow-lg shadow-orange-500/20 text-[8px] px-3 py-1 font-black">PENDENTE</Badge>
                                        </div>

                                        <div className="flex items-start gap-5">
                                            <div className="w-16 h-16 rounded-[24px] bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner relative">
                                                <Package size={32} />
                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm border border-orange-50">
                                                    <Clock size={12} className="text-orange-400" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-2 pt-1">
                                                <h4 className="font-black text-slate-900 text-lg leading-none tracking-tight">{pkg.description}</h4>
                                                <div className="flex flex-col gap-1">
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                                                        <User size={10} className="text-slate-300" /> Recebido por: {pkg.received_by || 'Portaria'}
                                                    </p>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">
                                                        {formatDate(pkg.received_at)} • {formatTime(pkg.received_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                                            <div className="flex -space-x-2">
                                                {[1, 2, 3].map(i => <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white" />)}
                                            </div>
                                            <button className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                                                Ver Detalhes <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Histórico de Entregas */}
                    <section className="animate-in slide-in-from-bottom-4 duration-700">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-1">Histórico de Movimentação</h3>
                        {deliveredPackages.length === 0 ? (
                            <div className="bg-slate-50/50 p-8 rounded-[32px] border border-slate-100 text-center">
                                <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest leading-relaxed">Nenhum registro<br />nas últimas 48 horas</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {deliveredPackages.map(pkg => (
                                    <div key={pkg.id} className="bg-white p-5 rounded-[28px] border border-slate-50 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all active:scale-[0.99]">
                                        <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-inner shrink-0 group-hover:rotate-6 transition-transform">
                                            <Check size={28} className="stroke-[3]" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <h4 className="font-black text-slate-900 text-xs uppercase tracking-tight">Retirado: {pkg.description || 'Encomenda'}</h4>
                                                <span className="text-[9px] font-bold text-slate-300 uppercase">{formatDate(pkg.delivered_at || pkg.received_at)}</span>
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase leading-none">
                                                Portador: <span className="text-slate-600 italic">Morador (Handshake Digital)</span>
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </div>
            </div>
        );
    }

    // HUB VIEW
    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-32">
            <header className="p-6 pt-12 flex items-center gap-4 bg-white border-b border-slate-100 sticky top-0 z-40">
                <button onClick={onBack} className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center active:scale-95 transition-all"><ArrowLeft size={20} /></button>
                <h2 className="text-xl font-black italic uppercase text-slate-800">Central de Comunicação</h2>
            </header>

            <div className="p-6 space-y-8">
                {/* Quick Actions / Highlights */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setView('deliveries')}
                        className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left relative overflow-hidden group active:scale-95 transition-all"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/5 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500"></div>
                        <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-4 relative z-10">
                            <Package size={24} />
                            {unreadPackages > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">
                                    {unreadPackages}
                                </span>
                            )}
                        </div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-1 relative z-10">Encomendas</h3>
                        <p className="text-[10px] text-slate-400 font-bold relative z-10">
                            {unreadPackages > 0 ? `${unreadPackages} aguardando` : 'Tudo entregue'}
                        </p>
                    </button>

                    <button
                        onClick={() => openChat(channels.find(c => c.id === 'adm'))}
                        className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm text-left relative overflow-hidden group active:scale-95 transition-all"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-brand-500/5 rounded-bl-[100px] transition-transform group-hover:scale-150 duration-500"></div>
                        <div className="w-12 h-12 bg-brand-100 text-brand-600 rounded-2xl flex items-center justify-center mb-4 relative z-10">
                            <Shield size={24} />
                        </div>
                        <h3 className="font-black text-slate-800 text-sm uppercase tracking-wide mb-1 relative z-10">Administração</h3>
                        <p className="text-[10px] text-slate-400 font-bold relative z-10">Falar com a Adm</p>
                    </button>
                </div>

                {/* Recent Messages / Channels List */}
                <div>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversas</h3>
                    </div>

                    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
                        {channels.map(channel => (
                            <button
                                key={channel.id}
                                onClick={() => openChat(channel)}
                                className="w-full p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors active:bg-slate-100"
                            >
                                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 shrink-0 border-2 border-white shadow-sm font-bold">
                                    {channel.icon}
                                </div>
                                <div className="flex-1 text-left">
                                    <div className="flex justify-between items-center mb-1">
                                        <h4 className="font-bold text-slate-900 text-sm">{channel.name}</h4>
                                        <span className="text-[10px] text-slate-400 font-bold">{channel.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-1 flex items-center gap-1">
                                        <span className="opacity-60">{channel.lastMessage}</span>
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-slate-300" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notices Section (could be repurposed from existing functionality) */}
                <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full -mr-16 -mt-16 blur-xl"></div>
                    <MessageSquare className="text-white/20 mb-4" size={32} />
                    <h3 className="font-black italic text-xl mb-2">Mural de Avisos</h3>
                    <p className="text-sm text-slate-400 mb-6">Fique por dentro das últimas novidades do condomínio.</p>
                    <Button variant="secondary" className="bg-white/10 text-white border-0 hover:bg-white/20">Ver Avisos</Button>
                </div>
            </div>
        </div>
    );
};
