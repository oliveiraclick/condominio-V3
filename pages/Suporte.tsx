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
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">Central de Ajuda</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                {/* Hero Section */}
                <div className="bg-gradient-to-br from-brand-600 to-brand-700 p-8 rounded-3xl shadow-lg text-white">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <HelpCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic tracking-tight">Precisa de Ajuda?</h2>
                            <p className="text-brand-100 text-sm font-medium">Estamos aqui para você</p>
                        </div>
                    </div>
                    <p className="text-white/90 leading-relaxed">
                        Encontre respostas rápidas nas perguntas frequentes abaixo ou entre em contato com nossa equipe de suporte.
                    </p>
                </div>

                {/* FAQ Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Perguntas Frequentes</h2>
                    </div>

                    <div className="space-y-3">
                        {faqItems.map((item, index) => (
                            <div key={index} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
                                >
                                    <span className="font-bold text-slate-900 pr-4">{item.question}</span>
                                    {expandedFAQ === index ? (
                                        <ChevronUp className="w-5 h-5 text-brand-600 shrink-0" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                                    )}
                                </button>
                                {expandedFAQ === index && (
                                    <div className="px-4 pb-4 pt-0 text-slate-600 leading-relaxed animate-in fade-in slide-in-from-top-2 duration-200">
                                        {item.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Mail className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Entre em Contato</h2>
                    </div>

                    <p className="text-slate-600 mb-6">
                        Não encontrou a resposta que procurava? Nossa equipe está pronta para ajudar!
                    </p>

                    <a
                        href="mailto:ia.oliveira.click@gmail.com?subject=Solicitação de Suporte - App Morador"
                        className="flex items-center justify-center gap-3 w-full h-14 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl font-bold transition-all active:scale-95 shadow-lg shadow-brand-600/20"
                    >
                        <Mail className="w-5 h-5" />
                        ia.oliveira.click@gmail.com
                    </a>

                    <div className="mt-4 p-4 bg-slate-50 rounded-xl">
                        <p className="text-xs text-slate-500 text-center">
                            Tempo médio de resposta: 24 horas úteis
                        </p>
                    </div>
                </div>

                {/* Legal Links */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-slate-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Documentos Legais</h2>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={onNavigateToPrivacy}
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-brand-600" />
                                <span className="font-bold text-slate-900">Política de Privacidade</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition-colors" />
                        </button>

                        <a
                            href="https://morador.app/termos"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <FileText className="w-5 h-5 text-blue-600" />
                                <span className="font-bold text-slate-900">Termos de Uso</span>
                            </div>
                            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                        </a>
                    </div>
                </div>

                {/* App Info */}
                <div className="text-center text-slate-400 text-sm space-y-1 pb-8">
                    <p>App Morador - Gestão de Condomínios</p>
                    <p>Versão 3.0 • Janeiro 2026</p>
                </div>

            </div>
        </div>
    );
};
