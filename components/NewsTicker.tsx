import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Megaphone, X, Clock, AlertTriangle } from 'lucide-react';

export const NewsTicker: React.FC<{ userRole?: string }> = ({ userRole }) => {
    const [notices, setNotices] = useState<any[]>([]);
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

            if (data) setNotices(data);
        };

        loadNotices();

        // Subscribe to new notices? (Optional, kept simple for now)
    }, [userRole]);

    if (notices.length === 0) return null;

    return (
        <>
            {/* TICKER BAR */}
            <div className="w-full bg-slate-900 overflow-hidden relative h-10 flex items-center border-y border-white/5 shadow-sm">
                <div className="absolute left-0 z-10 h-full w-12 bg-gradient-to-r from-slate-900 to-transparent flex items-center justify-center pl-2">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center animate-pulse">
                        <Megaphone size={12} className="text-brand-400" />
                    </div>
                </div>

                <div className="flex animate-marquee whitespace-nowrap gap-12 items-center pl-10">
                    {/* Duplicating for seamless loop */}
                    {[...notices, ...notices].map((notice, idx) => (
                        <button
                            key={`${notice.id}-${idx}`}
                            onClick={() => setSelectedNotice(notice)}
                            className="flex items-center gap-2 group transition-colors"
                        >
                            <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">{new Date(notice.created_at).toLocaleDateString().slice(0, 5)}</span>
                            <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                                • {notice.title} <span className="opacity-50 mx-1">-</span> {notice.body.slice(0, 50)}{notice.body.length > 50 && '...'}
                            </span>
                        </button>
                    ))}
                </div>

                <div className="absolute right-0 z-10 h-full w-8 bg-gradient-to-l from-slate-900 to-transparent"></div>

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
            {selectedNotice && (
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
            )}
        </>
    );
};
