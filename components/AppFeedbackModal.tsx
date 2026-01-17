
import React, { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { supabase } from '../supabase';

export const AppFeedbackModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any; userRole: string }> = ({ isOpen, onClose, currentUser, userRole }) => {
    const [type, setType] = useState<'Dica' | 'Sugestão'>('Dica');
    const [area, setArea] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const areas = userRole === 'resident'
        ? ['Portaria', 'Lazer', 'Desapego', 'Financeiro', 'Reservas', 'Perfil', 'Mercado', 'Outros']
        : ['Agenda', 'Financeiro', 'Leads', 'Perfil', 'Chat', 'Geração de QR', 'Outros'];

    const handleSubmit = async () => {
        if (!area || !content) {
            alert('Por favor, selecione uma área e escreva sua mensagem.');
            return;
        }

        setLoading(true);
        const { error } = await supabase.from('app_feedback').insert([{
            user_id: currentUser.id,
            type,
            area,
            content,
            role: userRole,
            status: 'new'
        }]);

        if (!error) {
            alert('Obrigado pelo seu feedback! Ele será analisado pela nossa equipe.');
            onClose();
            setArea('');
            setContent('');
        } else {
            alert('Erro ao enviar feedback: ' + error.message);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[140] flex items-end justify-center animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative w-full max-w-md bg-white rounded-t-[40px] p-8 shadow-2xl animate-in slide-in-from-bottom-8 duration-300 pb-12">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                            <Sparkles size={20} />
                        </div>
                        <h2 className="text-2xl font-black italic text-slate-900 tracking-tighter">Sugestões</h2>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-90 transition-all">
                        <X size={20} className="text-slate-600" />
                    </button>
                </div>

                <div className="space-y-6">
                    <div className="flex gap-2">
                        {(['Dica', 'Sugestão'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setType(t)}
                                className={`flex-1 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${type === t ? 'bg-brand-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Para qual área?</label>
                        <div className="flex flex-wrap gap-2">
                            {areas.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setArea(a)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${area === a ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-400 border-slate-100'}`}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block ml-1">Sua mensagem</label>
                        <textarea
                            className="w-full bg-slate-50 border border-slate-100 rounded-[24px] p-5 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                            placeholder="Explique sua ideia ou sugestão..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black uppercase tracking-widest text-xs hover:bg-slate-800 active:scale-[0.98] transition-all disabled:opacity-50 shadow-xl shadow-slate-900/20"
                    >
                        {loading ? 'Enviando...' : 'Enviar Feedback'}
                    </button>
                </div>
            </div>
        </div>
    );
};
