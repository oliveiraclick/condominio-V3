import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Mail, Phone, MessageCircle, ChevronDown, ChevronUp, FileText, Shield, ExternalLink } from 'lucide-react';

interface SupportPageProps {
    onBack: () => void;
    onNavigateToPrivacy?: () => void;
}

interface FAQItem {
    question: string;
    answer: string;
}

export const SupportPage: React.FC<SupportPageProps> = ({ onBack, onNavigateToPrivacy }) => {
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

    const faqItems: FAQItem[] = [
        {
            question: "Como faço para me cadastrar no aplicativo?",
            answer: "O cadastro é feito pela administração do seu condomínio. Entre em contato com o síndico ou administrador para solicitar seu acesso. Eles irão criar sua conta e você receberá as instruções de login por e-mail."
        },
        {
            question: "Esqueci minha senha, como recupero?",
            answer: "Na tela de login, clique em 'Esqueci minha senha'. Digite seu e-mail cadastrado e você receberá um link para redefinir sua senha. Se não receber o e-mail, verifique sua caixa de spam ou entre em contato com o suporte."
        },
        {
            question: "Como atualizo meus dados cadastrais?",
            answer: "Acesse o menu 'Perfil' no aplicativo e clique em 'Editar Perfil'. Você pode atualizar seu nome, telefone e foto. Para alterar dados como unidade ou condomínio, entre em contato com a administração."
        },
        {
            question: "Como faço para reservar uma área comum?",
            answer: "Acesse o menu 'Reservas', escolha a área desejada (churrasqueira, salão de festas, etc.), selecione a data disponível e confirme. Você receberá uma confirmação e poderá visualizar suas reservas ativas."
        },
        {
            question: "Como solicito um serviço de profissional?",
            answer: "Vá até 'Serviços', navegue pelas categorias ou use a busca para encontrar o profissional desejado. Clique no perfil e escolha 'Solicitar Serviço' ou entre em contato direto via WhatsApp."
        },
        {
            question: "Como autorizo a entrada de visitantes?",
            answer: "Acesse 'Portaria Digital', clique em 'Nova Autorização', preencha os dados do visitante (nome, documento, data/hora) e gere o QR Code. Compartilhe o código com seu visitante para apresentar na portaria."
        },
        {
            question: "Não consigo fazer login, o que faço?",
            answer: "Verifique se está usando o e-mail correto cadastrado. Certifique-se de que sua senha está correta (atenção para maiúsculas/minúsculas). Se o problema persistir, use a opção 'Esqueci minha senha' ou entre em contato com o suporte."
        },
        {
            question: "Como excluo minha conta?",
            answer: "Para excluir sua conta e todos os dados associados, acesse 'Perfil' > 'Configurações' > 'Excluir Conta'. Você também pode solicitar a exclusão entrando em contato com nosso suporte."
        }
    ];

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-md shadow-sm border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Central de Ajuda</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Hero Section */}
                <div className="bg-brand-gradient-horizontal p-8 rounded-[32px] shadow-2xl shadow-brand-glow text-brand-contrast relative overflow-hidden border border-white/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-inner">
                            <HelpCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tight">Precisa de Ajuda?</h2>
                            <p className="text-brand-100 text-sm font-bold uppercase tracking-widest">Estamos aqui para você</p>
                        </div>
                    </div>
                    <p className="text-white/90 leading-relaxed font-medium relative z-10">
                        Encontre respostas rápidas nas perguntas frequentes abaixo ou entre em contato com nossa equipe de suporte.
                    </p>
                </div>

                {/* FAQ Section */}
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                            <MessageCircle className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Perguntas Frequentes</h2>
                    </div>

                    <div className="space-y-3">
                        {faqItems.map((item, index) => (
                            <div key={index} className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50 transition-all hover:bg-white hover:shadow-sm">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full p-4 flex items-center justify-between text-left group"
                                >
                                    <span className="font-bold text-slate-700 pr-4 group-hover:text-brand-primary transition-colors">{item.question}</span>
                                    {expandedFAQ === index ? (
                                        <ChevronUp className="w-5 h-5 text-brand-primary shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0 group-hover:text-slate-600 transition-colors" />
                                    )}
                                </button>
                                {expandedFAQ === index && (
                                    <div className="px-4 pb-4 pt-2 text-slate-500 leading-relaxed text-sm animate-in fade-in slide-in-from-top-2 duration-200 border-t border-slate-100 bg-white">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                            <Mail className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Entre em Contato</h2>
                    </div>

                    <p className="text-slate-500 mb-6 font-medium">
                        Não encontrou a resposta que procurava? Nossa equipe está pronta para ajudar!
                    </p>

                    <a
                        href="mailto:ia.oliveira.click@gmail.com?subject=Solicitação de Suporte - App Morador"
                        className="flex items-center justify-center gap-3 w-full h-14 bg-brand-gradient-horizontal hover:opacity-90 text-brand-contrast rounded-2xl font-black uppercase text-xs tracking-widest transition-all active:scale-95 shadow-lg shadow-brand-glow group border-none"
                    >
                        <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        ia.oliveira.click@gmail.com
                    </a>

                    <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-xs text-slate-500 text-center font-bold uppercase tracking-wide">
                            Tempo médio de resposta: <span className="text-emerald-500">24 horas úteis</span>
                        </p>
                    </div>
                </div>

                {/* Legal Links */}
                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100">
                            <FileText className="w-5 h-5 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Documentos Legais</h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onNavigateToPrivacy}
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl transition-all border border-slate-100 hover:border-brand-100 group active:scale-95 hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-brand-primary" />
                                <span className="font-bold text-slate-700 group-hover:text-brand-primary transition-colors">Política de Privacidade</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-primary transition-colors" />
                        </button>

                        <a
                            href="https://morador.app/termos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-white rounded-2xl transition-all border border-slate-100 hover:border-blue-200 group active:scale-95 hover:shadow-sm"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-500" />
                                <span className="font-bold text-slate-700 group-hover:text-blue-600 transition-colors">Termos de Uso</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                        </a>
                    </div>
                </div>

                {/* App Info */}
                <div className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] space-y-1 pb-8 opacity-70">
                    <p>App Morador - Gestão de Condomínios</p>
                    <p>Versão 3.0.0 • Janeiro 2026</p>
                </div>

            </div>
        </div>
    );
};
