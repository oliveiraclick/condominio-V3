import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Mail } from 'lucide-react';

interface PrivacyPageProps {
    onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
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
                    <h1 className="text-lg font-bold text-slate-900 uppercase tracking-tight">Política de Privacidade</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center border border-brand-100">
                            <Shield className="w-5 h-5 text-brand-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Proteção de Dados</h2>
                    </div>
                    <p className="text-slate-500 leading-relaxed font-medium">
                        O App Morador ("nós", "nosso") leva a sua privacidade a sério. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nosso aplicativo de gestão de condomínios.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center border border-blue-100">
                            <Eye className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Coleta de Informações</h2>
                    </div>
                    <div className="space-y-4 text-slate-500 font-medium">
                        <p>Coletamos as seguintes informações para fornecer nossos serviços:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-slate-700">Dados de Identificação:</strong> Nome, e-mail, telefone e foto de perfil.</li>
                            <li><strong className="text-slate-700">Dados Residenciais:</strong> Condomínio, torre e unidade.</li>
                            <li><strong className="text-slate-700">Dados de Uso:</strong> Registros de acesso, reservas de áreas comuns e solicitações de serviços.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100">
                            <Lock className="w-5 h-5 text-emerald-500" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Uso das Informações</h2>
                    </div>
                    <div className="space-y-4 text-slate-500 font-medium">
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Gerenciar seu acesso ao condomínio e áreas comuns via reconhecimento facial ou QR Code.</li>
                            <li>Facilitar a comunicação entre moradores, portaria e administração.</li>
                            <li>Processar reservas e solicitações de serviços.</li>
                            <li>Melhorar a segurança e funcionalidade do aplicativo.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 backdrop-blur-sm">
                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-sm">Compartilhamento de Dados</h3>
                    <p className="text-slate-500 mb-6 font-medium">
                        Não vendemos suas informações pessoais. Compartilhamos dados apenas com a administração do seu condomínio para fins operacionais e de segurança.
                    </p>

                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-sm">Seus Direitos</h3>
                    <p className="text-slate-500 mb-6 font-medium">
                        Você pode solicitar o acesso, correção ou exclusão de seus dados pessoais entrando em contato com a administração do seu condomínio ou através do nosso suporte.
                    </p>

                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wide text-sm">Exclusão de Conta</h3>
                    <p className="text-slate-500 font-medium">
                        Para excluir sua conta e dados associados, acesse a seção "Perfil" no aplicativo e selecione a opção "Excluir Conta", ou <a href="mailto:suporte@oliveiraclick.com.br?subject=Solicitação de Exclusão de Dados - App Morador" className="text-brand-600 hover:text-brand-500 hover:underline">entre em contato conosco para solicitar a remoção manual</a>.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-[32px] shadow-lg border border-slate-100 flex items-start gap-4 backdrop-blur-sm">
                    <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0 border border-slate-100">
                        <Mail className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2 uppercase tracking-tight">Contato</h2>
                        <p className="text-slate-500 font-medium">
                            Se tiver dúvidas sobre esta política, entre em contato através do e-mail:
                            <br />
                            <a href="mailto:suporte@oliveiraclick.com.br" className="text-brand-600 hover:text-brand-500 hover:underline font-bold">
                                suporte@oliveiraclick.com.br
                            </a>
                        </p>
                    </div>
                </div>

                <div className="text-center text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] space-y-1 pb-8 opacity-70">
                    <p>App Morador - Gestão de Condomínios</p>
                    <p>Última atualização: Janeiro de 2026</p>
                </div>

            </div>
        </div>
    );
};
