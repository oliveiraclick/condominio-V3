import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, User, CheckCircle, ChevronRight, ShieldCheck, Scan, X, CheckSquare, Square } from 'lucide-react';
import { supabase } from '../supabase';
import { Scanner } from '@yudiel/react-qr-scanner';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSInput } from './design-system/Input';
import { Title, Text } from './design-system/Typography';
import { colors, radius, spacing } from './design-system/tokens';
import { packagesCache, CACHE_KEYS } from '../cache/packagesCache';

interface PackageData {
    id: string;
    original_code: string;
    carrier_name?: string;
    courier_name?: string;
    internal_code?: string;
    created_at: string;
    status: string;
}

interface ResidentData {
    id: string;
    name: string;
    unit: string;
    tower: string;
}

interface PackagePickupFlowProps {
    open: boolean;
    onClose: () => void;
    currentUser?: { name: string; id: string };
}

type Step = 'identify_resident' | 'resident_packages' | 'waiting_confirmation' | 'success';

export const PackagePickupFlow: React.FC<PackagePickupFlowProps> = ({ open, onClose, currentUser }) => {
    // Flow State
    const [step, setStep] = useState<Step>('identify_resident');
    const [loading, setLoading] = useState(false);

    // Data State
    const [searchTerm, setSearchTerm] = useState('');
    const [residents, setResidents] = useState<ResidentData[]>([]);
    const [selectedResident, setSelectedResident] = useState<ResidentData | null>(null);
    const [residentPackages, setResidentPackages] = useState<PackageData[]>([]);
    const [scannedIds, setScannedIds] = useState<Set<string>>(new Set());

    // Confirmation State
    const [confirmedByResident, setConfirmedByResident] = useState(false);
    const [pickupRequestId, setPickupRequestId] = useState<string | null>(null);

    // Realtime subscription ref
    const channelRef = useRef<any>(null);

    // UI State
    const [activeScanner, setActiveScanner] = useState<'resident' | 'package' | null>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
            // Auto-focus search on open
            setTimeout(() => searchInputRef.current?.focus(), 100);
        }
    }, [open]);

    const resetFlow = () => {
        // Cleanup realtime subscription
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current);
            channelRef.current = null;
        }

        setStep('identify_resident');
        setSearchTerm('');
        setResidents([]);
        setSelectedResident(null);
        setResidentPackages([]);
        setScannedIds(new Set());
        setConfirmedByResident(false);
        setPickupRequestId(null);
        setActiveScanner(null);
        setTimeout(() => searchInputRef.current?.focus(), 100);
    };

    // Helper: Format resident display name
    const formatResidentDisplay = (resident: ResidentData) => {
        const firstName = resident.name.split(' ')[0];
        return `${firstName}, ${resident.tower}, ${resident.unit}`;
    };

    // --- STEP 1: IDENTIFY RESIDENT ---

    // Search residents by name/unit
    useEffect(() => {
        if (step !== 'identify_resident' || searchTerm.length < 2) {
            if (searchTerm.length === 0) setResidents([]);
            return;
        }

        const delayDebounce = setTimeout(async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, unit, tower')
                .eq('role', 'resident')
                .or(`name.ilike.%${searchTerm}%,unit.ilike.%${searchTerm}%`)
                .limit(5);

            if (data) setResidents(data);
            setLoading(false);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm, step]);

    const handleScanResident = async (code: string) => {
        if (!code) return;
        setLoading(true);
        try {
            // Extract UUID from QR code format (e.g., "RESIDENT:uuid" or just "uuid")
            let residentId = code;
            if (code.startsWith('RESIDENT:')) {
                residentId = code.replace('RESIDENT:', '');
            }

            // 1. Try Direct Resident ID (QR Code do Morador)
            let { data: resident, error } = await supabase
                .from('profiles')
                .select('id, name, unit, tower')
                .eq('id', residentId)
                .eq('role', 'resident')
                .maybeSingle();

            // 2. If not found, Try Package Code (QR Code da Encomenda)
            // Allows identifying resident by scanning their package
            if (!resident) {
                const { data: pkg } = await supabase
                    .from('packages')
                    .select('resident_id')
                    .or(`original_code.eq.${code},internal_code.eq.${code}`)
                    .limit(1)
                    .maybeSingle();

                if (pkg?.resident_id) {
                    const { data: resFromPkg } = await supabase
                        .from('profiles')
                        .select('id, name, unit, tower')
                        .eq('id', pkg.resident_id)
                        .single();

                    if (resFromPkg) resident = resFromPkg;
                }
            }

            if (resident) {
                handleSelectResident(resident);
            } else {
                alert('Morador ou Pacote não encontrado via QR Code.');
            }
        } catch (e) {
            console.error(e);
            alert('Erro ao buscar registro.');
        } finally {
            setLoading(false);
            setActiveScanner(null);
        }
    };

    const handleSelectResident = async (resident: ResidentData) => {
        setSelectedResident(resident);

        // Try cache first
        const cacheKey = CACHE_KEYS.RESIDENT_PACKAGES(resident.id);
        const cached = packagesCache.get<PackageData[]>(cacheKey);

        if (cached) {
            // Cache hit - instant load
            setResidentPackages(cached);
            setStep('resident_packages');
            return;
        }

        // Cache miss - fetch from server
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .eq('resident_id', resident.id)
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            const packages = data || [];
            setResidentPackages(packages);

            // Store in cache for next time
            packagesCache.set(cacheKey, packages);

            setStep('resident_packages');
        } catch (e) {
            console.error(e);
            alert('Erro ao buscar encomendas.');
        } finally {
            setLoading(false);
        }
    };

    // --- STEP 2: SCAN PACKAGES ---

    const handleScanPackage = async (code: string) => {
        if (!code) return;

        // Find package that matches this code (internal or original)
        const pkg = residentPackages.find(p => p.original_code === code || p.internal_code === code);

        if (pkg) {
            // Check if already scanned
            if (scannedIds.has(pkg.id)) {
                alert('✅ Este pacote já foi verificado!\n\nVocê pode continuar escaneando outros pacotes ou finalizar a retirada.');
                return;
            }

            // Add to scanned list
            setScannedIds(prev => {
                const next = new Set(prev);
                next.add(pkg.id);
                return next;
            });

            // Success feedback
            try {
                // Vibration feedback (mobile devices)
                if ('vibrate' in navigator) {
                    navigator.vibrate(100);
                }

                // Visual confirmation
                const packageCode = pkg.internal_code || pkg.original_code;
                console.log(`✅ Pacote verificado: ${packageCode}`);

                // Optional: Show toast instead of alert for better UX
                // For now, we rely on the visual update in the list

            } catch (e) {
                // Ignore feedback errors
            }

            // Don't close scanner yet, allow multiple scans
        } else {
            // Enhanced error handling - check WHY it doesn't match
            try {
                const { data: foundPkg } = await supabase
                    .from('packages')
                    .select('id, resident_id, status, internal_code, original_code, profiles(name, unit)')
                    .or(`original_code.eq.${code},internal_code.eq.${code}`)
                    .maybeSingle();

                if (!foundPkg) {
                    alert('❌ QR Code não encontrado no sistema.\n\nVerifique se a encomenda foi triada corretamente.');
                } else if (foundPkg.status === 'delivered') {
                    alert('⚠️ Esta encomenda já foi entregue anteriormente.');
                } else if (foundPkg.resident_id !== selectedResident?.id) {
                    const ownerInfo = foundPkg.profiles as any;
                    alert(`⚠️ Encomenda de outro morador!\n\nEsta encomenda pertence a:\n${ownerInfo?.name || 'Morador desconhecido'}\nUnidade: ${ownerInfo?.unit || 'N/A'}\n\nMorador selecionado:\n${selectedResident?.name}\nUnidade: ${selectedResident?.unit}`);
                } else {
                    alert('⚠️ Pacote encontrado mas não está pendente para retirada.\n\nStatus atual: ' + foundPkg.status);
                }
            } catch (err) {
                console.error('Error checking package:', err);
                alert('❌ Erro ao verificar pacote. Tente novamente.');
            }
        }
    };

    const handleProceedToConfirmation = async () => {
        if (scannedIds.size === 0) {
            alert('Por favor, bipe ao menos um pacote para continuar.');
            return;
        }

        if (!selectedResident || !currentUser) return;

        setLoading(true);
        try {
            // Create pickup request
            const { data: request, error: requestError } = await supabase
                .from('package_pickup_requests')
                .insert({
                    resident_id: selectedResident.id,
                    employee_id: currentUser.id,
                    package_ids: Array.from(scannedIds),
                    status: 'pending'
                })
                .select()
                .single();

            if (requestError) throw requestError;

            setPickupRequestId(request.id);

            // Send push notification to resident
            supabase.functions.invoke('push', {
                body: {
                    title: '📦 Confirme a Retirada',
                    body: `Você tem ${scannedIds.size} encomenda(s) para confirmar`,
                    target_user_id: selectedResident.id,
                    data: {
                        type: 'package_pickup_request',
                        request_id: request.id
                    }
                }
            }).catch(err => console.error('Push Error:', err));

            // Setup realtime subscription
            const channel = supabase
                .channel(`pickup_request_${request.id}`)
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'package_pickup_requests',
                    filter: `id=eq.${request.id}`
                }, (payload: any) => {
                    if (payload.new.status === 'confirmed') {
                        setConfirmedByResident(true);
                        setStep('success');

                        // Invalidate cache so next load gets fresh data
                        if (selectedResident) {
                            packagesCache.invalidate(CACHE_KEYS.RESIDENT_PACKAGES(selectedResident.id));
                        }

                        // Cleanup subscription
                        supabase.removeChannel(channel);
                        channelRef.current = null;
                    }
                })
                .subscribe();

            channelRef.current = channel;
            setStep('waiting_confirmation');

        } catch (err) {
            console.error('Error creating pickup request:', err);
            alert('Erro ao solicitar confirmação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER HELPERS ---

    const renderHeader = () => {
        switch (step) {
            case 'identify_resident': return { title: 'Identificar Morador', subtitle: 'Bipe o morador ou busque pelo nome' };
            case 'resident_packages': return { title: 'Bipar Encomendas', subtitle: `${scannedIds.size} de ${residentPackages.length} verificados` };
            case 'waiting_confirmation': return { title: 'Aguardando Confirmação', subtitle: 'O morador deve confirmar no próprio celular' };
            case 'success': return { title: 'Entrega Realizada', subtitle: 'Processo finalizado com sucesso' };
        }
    };

    const header = renderHeader();

    return (
        <Sheet
            open={open}
            onClose={onClose}
            title={header.title}
            subtitle={header.subtitle}
            height="90vh"
        >
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.md }}>

                {/* --- SCANNER OVERLAY --- */}
                {activeScanner && (
                    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
                        <div className="relative flex-1 bg-black">
                            <button
                                onClick={() => setActiveScanner(null)}
                                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center text-white"
                            >
                                <X size={24} />
                            </button>
                            <Scanner
                                onScan={(results) => {
                                    if (results?.[0]?.rawValue) {
                                        if (activeScanner === 'resident') handleScanResident(results[0].rawValue);
                                        if (activeScanner === 'package') handleScanPackage(results[0].rawValue);
                                    }
                                }}
                                allowMultiple={activeScanner === 'package'}
                                scanDelay={activeScanner === 'package' ? 500 : 2000}
                            />
                            <div className="absolute bottom-24 left-0 right-0 text-center pointer-events-none">
                                <p className="text-white font-bold bg-black/50 inline-block px-6 py-3 rounded-full backdrop-blur text-sm uppercase tracking-widest border border-white/10">
                                    {activeScanner === 'resident' ? 'QR Code do Morador' : 'Bipe o Pacote'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}


                {/* --- STEP 1: IDENTIFY --- */}
                {step === 'identify_resident' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.lg, height: '100%' }}>

                        <div style={{ display: 'flex', gap: spacing.sm }}>
                            <div style={{ flex: 1 }}>
                                <DSInput
                                    ref={searchInputRef}
                                    label="Buscar Morador"
                                    placeholder="Nome, Unidade ou Bloco..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    leftIcon={<Search size={18} />}
                                    fullWidth
                                    autoFocus
                                />
                            </div>
                            <button
                                onClick={() => setActiveScanner('resident')}
                                style={{
                                    width: 48, height: 48,
                                    borderRadius: radius.md,
                                    backgroundColor: colors.brand[50],
                                    border: `1px solid ${colors.brand[200]}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginTop: 24,
                                    cursor: 'pointer',
                                    color: colors.brand[600]
                                }}
                            >
                                <Scan size={24} />
                            </button>
                        </div>

                        {/* Results List */}
                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            {loading && <Text style={{ textAlign: 'center', color: colors.neutral[500] }}>Buscando...</Text>}

                            {!loading && residents.length > 0 && residents.map(res => (
                                <div
                                    key={res.id}
                                    onClick={() => handleSelectResident(res)}
                                    style={{
                                        padding: spacing.md,
                                        backgroundColor: 'white',
                                        border: `1px solid ${colors.neutral[200]}`,
                                        borderRadius: radius.lg,
                                        cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: spacing.md
                                    }}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: '50%',
                                        backgroundColor: colors.neutral[100],
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <User size={20} className="text-slate-500" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <Text weight="bold">{formatResidentDisplay(res)}</Text>
                                        <Text variant="caption" style={{ color: colors.neutral[500] }}>
                                            {res.name}
                                        </Text>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* --- STEP 2: PACKAGE SCANNING --- */}
                {step === 'resident_packages' && selectedResident && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.md }}>

                        {/* Info Header */}
                        <div style={{
                            backgroundColor: colors.neutral[50],
                            padding: spacing.md,
                            borderRadius: radius.lg,
                            border: `1px solid ${colors.neutral[200]}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                        }}>
                            <div>
                                <Text weight="bold">{formatResidentDisplay(selectedResident)}</Text>
                                <Text variant="caption">{selectedResident.name}</Text>
                            </div>
                            <DSButton size="small" variant="secondary" onClick={() => setActiveScanner('package')} leftIcon={<Scan size={14} />}>
                                Bipar Pacote
                            </DSButton>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                            {residentPackages.length === 0 ? (
                                <Text style={{ textAlign: 'center', padding: spacing.xl }}>Nenhuma encomenda pendente.</Text>
                            ) : (
                                residentPackages.map(pkg => {
                                    const isScanned = scannedIds.has(pkg.id);
                                    return (
                                        <div key={pkg.id} style={{
                                            padding: spacing.md,
                                            backgroundColor: isScanned ? colors.brand[50] : 'white',
                                            border: `1px solid ${isScanned ? colors.brand[400] : colors.neutral[200]}`,
                                            borderRadius: radius.lg,
                                            display: 'flex', alignItems: 'center', gap: spacing.md
                                        }}>
                                            <div style={{
                                                width: 32, height: 32, borderRadius: 8,
                                                backgroundColor: isScanned ? colors.brand[600] : colors.neutral[100],
                                                color: isScanned ? 'white' : colors.neutral[400],
                                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isScanned ? <CheckCircle size={18} /> : <Package size={18} />}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <Text weight="bold" style={{ color: isScanned ? colors.brand[900] : colors.neutral[900] }}>
                                                    {pkg.internal_code || pkg.original_code}
                                                </Text>
                                                <Text variant="caption">{pkg.carrier_name || 'Correios'}</Text>
                                            </div>
                                            {isScanned && (
                                                <Text variant="caption" weight="bold" style={{ color: colors.brand[600], textTransform: 'uppercase' }}>
                                                    Verificado
                                                </Text>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div style={{ display: 'flex', gap: spacing.md, paddingTop: spacing.md, borderTop: `1px solid ${colors.neutral[100]}` }}>
                            <DSButton variant="secondary" onClick={() => setStep('identify_resident')} style={{ flex: 1 }}>Voltar</DSButton>
                            <DSButton
                                variant="primary"
                                onClick={handleProceedToConfirmation}
                                style={{ flex: 2 }}
                                disabled={scannedIds.size === 0}
                                leftIcon={<CheckSquare size={18} />}
                            >
                                Confirmar {scannedIds.size} Volume(s)
                            </DSButton>
                        </div>
                    </div>
                )}


                {/* --- STEP 3: WAITING FOR RESIDENT CONFIRMATION --- */}
                {step === 'waiting_confirmation' && selectedResident && (
                    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: spacing.xl, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>

                        <div style={{
                            width: 80,
                            height: 80,
                            borderRadius: '50%',
                            backgroundColor: colors.brand[50],
                            color: colors.brand[600],
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Package size={40} className="animate-pulse" />
                        </div>

                        <div>
                            <Title level={2}>Aguardando Confirmação</Title>
                            <Text style={{ marginTop: spacing.sm, color: colors.neutral[600] }}>
                                {formatResidentDisplay(selectedResident)} deve confirmar o recebimento no próprio celular
                            </Text>
                        </div>

                        <div style={{
                            padding: spacing.lg,
                            backgroundColor: colors.neutral[50],
                            borderRadius: radius.lg,
                            border: `1px solid ${colors.neutral[200]}`,
                            width: '100%',
                            maxWidth: 400
                        }}>
                            <Text variant="caption" weight="bold" style={{ marginBottom: spacing.sm, display: 'block', textTransform: 'uppercase', color: colors.neutral[500] }}>
                                PACOTES AGUARDANDO:
                            </Text>
                            {residentPackages.filter(p => scannedIds.has(p.id)).map(pkg => (
                                <div key={pkg.id} style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                                    <Package size={14} style={{ color: colors.neutral[400] }} />
                                    <Text style={{ fontSize: 14 }}>{pkg.internal_code || pkg.original_code}</Text>
                                </div>
                            ))}
                        </div>

                        <DSButton
                            variant="secondary"
                            onClick={() => {
                                // Cancel request and go back
                                if (pickupRequestId) {
                                    supabase
                                        .from('package_pickup_requests')
                                        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
                                        .eq('id', pickupRequestId)
                                        .then(() => {
                                            setStep('resident_packages');
                                            setPickupRequestId(null);
                                        });
                                }
                            }}
                        >
                            Cancelar Solicitação
                        </DSButton>
                    </div>
                )}


                {/* --- STEP 4: SUCCESS --- */}
                {step === 'success' && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: spacing.xl }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle size={40} />
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <Title level={2}>Tudo Pronto!</Title>
                            <Text>A retirada foi registrada e notificada.</Text>
                        </div>
                        <DSButton fullWidth size="lg" onClick={resetFlow}>Nova Retirada</DSButton>
                    </div>
                )}

            </div>
        </Sheet>
    );
};
