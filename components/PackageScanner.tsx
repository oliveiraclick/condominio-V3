import React, { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import { X, CheckCircle2 } from 'lucide-react';
import { Button } from './ui';
import { Scanner } from '@yudiel/react-qr-scanner';

import { Camera } from '@capacitor/camera';

export const PackageScanner: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any }> = ({ isOpen, onClose, currentUser }) => {
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const checkPermission = async () => {
                try {
                    const status = await Camera.checkPermissions();
                    if (status.camera === 'granted') {
                        setPermissionGranted(true);
                    } else {
                        const request = await Camera.requestPermissions({ permissions: ['camera'] });
                        if (request.camera === 'granted' || request.camera === 'limited') {
                            setPermissionGranted(true);
                        } else {
                            alert('Precisamos da permissão da câmera para ler o QR Code.');
                            onClose();
                        }
                    }
                } catch (e) {
                    console.error("Erro ao verificar permissão nativa:", e);
                    // Fallback para web/navegador
                    setPermissionGranted(true);
                }
            };
            checkPermission();
        }
    }, [isOpen]);

    if (!isOpen) return null;
    if (!permissionGranted) return <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">Verificando permissões...</div>;

    const handleScan = async (text: string) => {
        if (text && !isProcessing && !success) {
            setIsProcessing(true);
            setScannedData(text);

            try {
                // Use Secure RPC to handle pickup (Handles RLS and Authorization internally)
                const { data, error } = await supabase.rpc('pickup_package', { qr_text: text });

                if (error) throw new Error(error.message);

                if (data && !data.success) {
                    throw new Error(data.message);
                }

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
                                onError={(error: any) => alert(`Erro na câmera: ${error?.message || 'Permissão negada ou dispositivo não suportado.'}`)}
                                constraints={{ facingMode: 'environment' }}
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
