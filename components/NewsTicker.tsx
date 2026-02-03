import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Megaphone, X, Clock, AlertTriangle } from 'lucide-react';

export const NewsTicker: React.FC<{ userRole?: string; variant?: 'default' | 'warning' }> = ({ userRole, variant = 'default' }) => {
    // HARDCODED DEMO NOTICES AS REQUESTED
    const [notices, setNotices] = useState<any[]>([
        { id: 1, title: 'Manutenção', body: 'Troca de Lâmpadas nas ruas próxima Segunda Feira', created_at: new Date().toISOString() },
        { id: 2, title: 'Limpeza', body: 'Limpeza de Lotes será dia 15 deste mês.', created_at: new Date().toISOString() },
        { id: 3, title: 'Assembleia', body: 'Assembleia no próximo Sabado as 15:00hr', created_at: new Date().toISOString() }
    ]);
    const [selectedNotice, setSelectedNotice] = useState<any>(null);

    useEffect(() => {
        const loadNotices = async () => {
            // Fetch notices relevant to everyone ('all') or the specific role
            // Reuse 'sent_notifications' table which is used by AdminNotices
            const { data } = await supabase
                .from('sent_notifications')
                .select('*')
                .or(`target_role.eq.all,target_role.eq.${userRole === 'professional' ? 'professional' : 'resident'}`)
                .order('created_at', { ascending: false })
                .limit(10); // Last 10 notices

            if (data && data.length > 0) setNotices(data);
        };

        // loadNotices(); // Commented out to force requested messages for demo validation

        // Subscribe to new notices? (Optional, kept simple for now)
    }, [userRole]);

    if (notices.length === 0) return null;

    const isWarning = variant === 'warning';

    // VARIANT STYLES
    const containerClasses = isWarning
        ? "w-full bg-[#FACC15] flex items-center h-12 relative overflow-hidden shadow-sm mb-6" // Yellow theme
        : "w-full bg-slate-900 border-b border-slate-800 flex items-center h-10 relative overflow-hidden"; // Default Dark theme

    const badgeClasses = isWarning
        ? "bg-[#7C3AED] text-white text-[10px] font-black uppercase tracking-widest px-6 h-full flex items-center z-20 shrink-0 shadow-sm relative ml-[-1px] border-r border-[#EAB308]/30"
        : "bg-brand-gradient text-white text-[10px] font-black uppercase tracking-widest px-6 h-full flex items-center z-20 shrink-0 shadow-lg relative ml-[-1px]";

    const textDateClass = isWarning ? "text-slate-800/70 font-bold text-xs uppercase tracking-wider" : "text-amber-400 font-bold text-xs uppercase tracking-wider";
    const textTitleClass = isWarning ? "text-slate-900 text-xs font-bold tracking-wide" : "text-white text-xs font-medium tracking-wide";
    const textBodyClass = isWarning ? "text-slate-700" : "text-slate-500";
    const dotClass = isWarning ? "text-slate-400 mx-1" : "text-slate-500 mx-1";

    return (
        <>
            <div className={containerClasses}>
                {/* BADGE FIXO ESQUERDA */}
                <div className={badgeClasses}>
                    {isWarning ? <AlertTriangle size={14} className="mr-2 text-white" /> : <span className="animate-pulse mr-2 text-amber-400">●</span>}
                    {isWarning ? 'AVISOS' : 'AVISOS'}
                    {/* Extension to create the slant - only for default */}
                    {!isWarning && <div className="absolute top-0 -right-4 w-8 h-full bg-brand-500 transform skew-x-[-20deg]"></div>}
                    {isWarning && <div className="absolute top-0 -right-4 w-8 h-full bg-[#7C3AED] transform skew-x-[-20deg]"></div>}
                </div>

                <div className="flex-1 overflow-hidden relative h-full flex items-center bg-transparent">
                    <div className="animate-marquee whitespace-nowrap flex items-center gap-12 pl-4">
                        {notices.map((notice, i) => (
                            <div
                                key={i}
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedNotice(notice)}
                            >
                                <span className={textDateClass}>{new Date(notice.created_at).toLocaleDateString()}</span>
                                <span className={textTitleClass}>
                                    {notice.title} <span className={dotClass}>•</span> <span className={textBodyClass}>{notice.body?.substring(0, 50)}{notice.body?.length > 50 && '...'}</span>
                                </span>
                            </div>
                        ))}
                        {/* Duplicate for smooth loop */}
                        {notices.map((notice, i) => (
                            <div
                                key={`dup-${i}`}
                                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => setSelectedNotice(notice)}
                            >
                                <span className={textDateClass}>{new Date(notice.created_at).toLocaleDateString()}</span>
                                <span className={textTitleClass}>
                                    {notice.title} <span className={dotClass}>•</span> <span className={textBodyClass}>{notice.body?.substring(0, 50)}{notice.body?.length > 50 && '...'}</span>
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee ${Math.max(20, notices.length * 10)}s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>
            </div>

            {/* READING MODAL */}
            {
                selectedNotice && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-200">
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedNotice(null)}></div>
                        <div className="relative w-full max-w-sm bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="bg-brand-500 h-24 relative p-6 flex flex-col justify-end">
                                <button onClick={() => setSelectedNotice(null)} className="absolute top-4 right-4 w-8 h-8 bg-black/20 text-white rounded-full flex items-center justify-center hover:bg-black/30 transition-colors">
                                    <X size={16} />
                                </button>
                                <Megaphone size={32} className="text-white/80 absolute top-4 left-6" />
                                <h3 className="text-xl font-black italic text-white leading-none tracking-tighter shadow-black drop-shadow-sm">{selectedNotice.title}</h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    <Clock size={12} />
                                    {new Date(selectedNotice.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedNotice.created_at).toLocaleTimeString('pt-BR').slice(0, 5)}
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2">
                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{selectedNotice.body}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedNotice(null)}
                                    className="w-full h-12 bg-slate-100 text-slate-600 font-black uppercase text-xs tracking-widest rounded-2xl hover:bg-slate-200 transition-colors"
                                >
                                    Fechar
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
};
