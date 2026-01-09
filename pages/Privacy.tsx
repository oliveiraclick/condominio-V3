import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Mail } from 'lucide-react';

interface PrivacyPageProps {
    onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-slate-600" />
                    </button>
                    <h1 className="text-lg font-bold text-slate-800">Política de Privacidade</h1>
                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center">
                            <Shield className="w-5 h-5 text-violet-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Proteção de Dados</h2>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                        O App Morador ("nós", "nosso") leva a sua privacidade a sério. Esta política descreve como coletamos, usamos e protegemos suas informações pessoais ao utilizar nosso aplicativo de gestão de condomínios.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Coleta de Informações</h2>
                    </div>
                    <div className="space-y-4 text-slate-600">
                        <p>Coletamos as seguintes informações para fornecer nossos serviços:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong>Dados de Identificação:</strong> Nome, e-mail, telefone e foto de perfil.</li>
                            <li><strong>Dados Residenciais:</strong> Condomínio, torre e unidade.</li>
                            <li><strong>Dados de Uso:</strong> Registros de acesso, reservas de áreas comuns e solicitações de serviços.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <Lock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">Uso das Informações</h2>
                    </div>
                    <div className="space-y-4 text-slate-600">
                        <p>Utilizamos seus dados para:</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>Gerenciar seu acesso ao condomínio e áreas comuns via reconhecimento facial ou QR Code.</li>
                            <li>Facilitar a comunicação entre moradores, portaria e administração.</li>
                            <li>Processar reservas e solicitações de serviços.</li>
                            <li>Melhorar a segurança e funcionalidade do aplicativo.</li>
                        </ul>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-2">Compartilhamento de Dados</h3>
                    <p className="text-slate-600 mb-4">
                        Não vendemos suas informações pessoais. Compartilhamos dados apenas com a administração do seu condomínio para fins operacionais e de segurança.
                    </p>

                    <h3 className="font-bold text-slate-900 mb-2">Seus Direitos</h3>
                    <p className="text-slate-600 mb-4">
                        Você pode solicitar o acesso, correção ou exclusão de seus dados pessoais entrando em contato com a administração do seu condomínio ou através do nosso suporte.
                    </p>

                    <h3 className="font-bold text-slate-900 mb-2">Exclusão de Conta</h3>
                    <p className="text-slate-600">
                        Para excluir sua conta e dados associados, acesse a seção "Perfil" no aplicativo e selecione a opção "Excluir Conta", ou <a href="mailto:suporte@oliveiraclick.com.br?subject=Solicitação de Exclusão de Dados - App Morador" className="text-violet-600 hover:underline">entre em contato conosco para solicitar a remoção manual</a>.
                    </p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">Contato</h2>
                        <p className="text-slate-600">
                            Se tiver dúvidas sobre esta política, entre em contato através do e-mail:
                            <br />
                            <a href="mailto:suporte@oliveiraclick.com.br" className="text-violet-600 hover:underline">
                                suporte@oliveiraclick.com.br
                            </a>
                        </p>
                    </div>
                </div>

                <div className="text-center text-slate-400 text-sm pb-8">
                    Última atualização: Janeiro de 2026
                </div>

            </div>
        </div>
    );
};
