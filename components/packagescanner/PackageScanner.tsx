import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../ui';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Camera } from '@capacitor/camera';
import { PackageStepLayout } from './PackageStepLayout';

export const PackageScanner: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}> = ({ isOpen, onClose, currentUser }) => {
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

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
        console.error('Erro ao verificar permissão:', e);
        setPermissionGranted(true); // fallback web
      }
    };

    checkPermission();
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  if (!permissionGranted) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center text-white">
        Verificando permissões...
      </div>
    );
  }

  const handleScan = async (text: string) => {
    if (!text || isProcessing || success) return;

    setIsProcessing(true);
    setScannedData(text);

    try {
      const { data, error } = await supabase.rpc('pickup_package', {
        qr_text: text,
      });

      if (error) throw new Error(error.message);
      if (data && !data.success) throw new Error(data.message);

      setSuccess(true);
    } catch (err: any) {
      alert(err.message);
      setScannedData(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <PackageStepLayout title="SCANNER" subtitle="Leitura de QR Code" onClose={onClose}>
      {success ? (
        <div className="bg-white p-8 rounded-[40px] text-center space-y-6 animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={40} />
          </div>

          <div>
            <h2 className="text-2xl font-black italic text-slate-900">Confirmado!</h2>
            <p className="text-sm text-slate-500 font-medium mt-2">
              Você retirou a encomenda com sucesso.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl text-left border border-slate-100">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
              Assinatura Digital
            </p>
            <p className="font-bold text-slate-900 text-xs mt-1">
              {currentUser?.name || 'Morador'} • {currentUser?.phone || 'Sem celular'}
            </p>

            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-3">
              Data/Hora
            </p>
            <p className="font-bold text-slate-900 text-xs mt-1">{new Date().toLocaleString()}</p>
          </div>

          <Button fullWidth onClick={onClose} className="bg-emerald-600">
            Fechar
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="w-full max-w-sm mx-auto aspect-square relative rounded-[32px] overflow-hidden border border-slate-200 shadow-sm">
            <Scanner
              onScan={(result) => result?.[0]?.rawValue && handleScan(result[0].rawValue)}
              onError={(error: any) =>
                alert(
                  `Erro na câmera: ${error?.message || 'Permissão negada ou não suportado.'}`
                )
              }
              constraints={{ facingMode: 'environment' }}
              styles={{ container: { width: '100%', height: '100%' } }}
              components={{ finder: false }}
            />

            {/* Overlay leve (opcional) */}
            <div className="absolute inset-0 border-[32px] border-black/20 rounded-[32px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 border-2 border-white/80 rounded-3xl flex items-center justify-center pointer-events-none">
              <div className="w-40 h-40 border border-dashed border-white/40 rounded-2xl animate-pulse" />
            </div>
          </div>

          <p className="text-slate-500 text-center text-sm font-medium px-6">
            Aponte a câmera para o QR Code na etiqueta da encomenda.
          </p>

          {isProcessing && (
            <p className="text-slate-900 text-center font-black animate-pulse">
              Processando...
            </p>
          )}
        </div>
      )}
    </PackageStepLayout>
  );
};
