import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui';
import { Scanner } from '@yudiel/react-qr-scanner';

export const PackageScanner: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any }> = ({ isOpen, onClose, currentUser }) => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleScan = async (text: string) => {
        if (text && !isProcessing && !success) {
            setIsProcessing(true);
            setScannedData(text);

            try {
                // 1. Verify if package exists and if user is authorized (Owner or Neighbor)
                const { data: pkg, error: fetchError } = await supabase
                    .from('packages')
                    .select('*')
                    .eq('qr_code', text)
                    .single();

                if (fetchError || !pkg) throw new Error('Encomenda não encontrada ou QR Code inválido.');
                if (pkg.status === 'delivered') throw new Error('Esta encomenda já foi retirada.');

                // Check authorization
                let isAuthorized = pkg.resident_id === currentUser.id;

                if (!isAuthorized) {
                    const { data: auth } = await supabase
                        .from('package_authorizations')
                        .select('id')
                        .eq('grantor_id', pkg.resident_id)
                        .eq('grantee_id', currentUser.id)
                        .eq('status', 'active')
                        .maybeSingle();

                    if (auth) isAuthorized = true;
                }

                if (!isAuthorized) throw new Error('Você não tem autorização para retirar esta encomenda.');

                // 2. Perform Digital Handshake (Update package with user info)
                const { error: updateError } = await supabase
                    .from('packages')
                    .update({
                        status: 'delivered',
                        picked_up_by: currentUser.id,
                        picked_up_at: new Date().toISOString(),
                        receiver_phone: currentUser.phone || 'Não informado' // Digital Signature
                    })
                    .eq('id', pkg.id);

                if (updateError) throw updateError;

                setSuccess(true);
                // Play success sound logic here if available or vibration

            } catch (error: any) {
                alert(error.message);
                setScannedData(null); // Reset to scan again
            } finally {
                setIsProcessing(false);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col animate-in fade-in duration-300">
            <div className="p-6 flex justify-between items-center z-10">
                <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md"><X size={20} /></button>
                <h3 className="text-white font-black italic tracking-widest text-sm">SCANNER</h3>
                <div className="w-10"></div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative">
                {success ? (
                    <div className="bg-white p-8 rounded-[40px] text-center space-y-6 animate-in zoom-in duration-300 mx-6">
                        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 size={40} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black italic text-slate-900">Confirmado!</h2>
                            <p className="text-sm text-slate-500 font-medium mt-2">Você retirou a encomenda com sucesso.</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Assinatura Digital</p>
                            <p className="font-bold text-slate-900 text-xs mt-1">{currentUser.name || 'Morador'} • {currentUser.phone || 'Sem celular'}</p>
                            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-2">Data/Hora</p>
                            <p className="font-bold text-slate-900 text-xs mt-1">{new Date().toLocaleString()}</p>
                        </div>
                        <Button fullWidth onClick={onClose} className="bg-emerald-600">Fechar</Button>
                    </div>
                ) : (
                    <>
                        <div className="w-full max-w-sm aspect-square relative rounded-[40px] overflow-hidden border-4 border-white/20 shadow-2xl">
                            <Scanner
                                onScan={(result) => result?.[0]?.rawValue && handleScan(result[0].rawValue)}
                                styles={{ container: { width: '100%', height: '100%' } }}
                                components={{ finder: false }}
                            />

                            {/* Custom Overlay */}
                            <div className="absolute inset-0 border-[40px] border-black/50 rounded-[40px]"></div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-white/80 rounded-3xl flex items-center justify-center">
                                <div className="w-44 h-44 border border-dashed border-white/30 rounded-2xl animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-white/70 text-center text-sm font-medium mt-8 px-10">Aponte a câmera para o QR Code na etiqueta da encomenda.</p>
                        {isProcessing && <p className="text-white font-black animate-pulse mt-4">Processando...</p>}
                    </>
                )}
            </div>
        </div>
    );
};
