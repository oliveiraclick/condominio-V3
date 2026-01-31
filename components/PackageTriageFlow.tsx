import React, { useState, useEffect, useRef, ErrorInfo } from 'react';
import { Package, Search, Scan, User, MapPin, CheckCircle, ArrowRight, Loader2, X, Camera } from 'lucide-react';
import { supabase } from '../supabase';
import { Scanner } from '@yudiel/react-qr-scanner';

import { Sheet } from './design-system/Sheet';
import { DSButton } from './design-system/Button';
import { DSInput } from './design-system/Input';
import { Title, Text } from './design-system/Typography';
import { colors, radius, spacing, shadows } from './design-system/tokens';
import { packagesCache, CACHE_KEYS } from '../cache/packagesCache';

interface PackageData {
    id: string;
    original_code: string;
    carrier_name?: string;
    created_at: string;
    status: string;
}

interface ResidentData {
    id: string;
    name: string;
    unit: string;
    tower: string;
}

interface PackageTriageFlowProps {
    open: boolean;
    onClose: () => void;
    currentUser: any;
}

type TriageStep = 'scan_carrier' | 'scan_internal' | 'identify_resident' | 'storage_location' | 'success';

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 text-red-800 rounded-lg">
                    <h3 className="font-bold">Ocorreu um erro no componente</h3>
                    <pre className="mt-2 text-xs overflow-auto">
                        {this.state.error?.toString()}
                    </pre>
                    <button
                        className="mt-4 px-4 py-2 bg-red-100 rounded hover:bg-red-200"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Tentar Novamente
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export const PackageTriageFlow: React.FC<PackageTriageFlowProps> = ({
    open,
    onClose,
    currentUser
}) => {
    // Flow State
    const [step, setStep] = useState<TriageStep>('scan_carrier');
    const [loading, setLoading] = useState(false);
    const [activeScanner, setActiveScanner] = useState<boolean>(false);

    // Data State
    const [carrierCode, setCarrierCode] = useState('');
    const [internalCode, setInternalCode] = useState('');
    const [residentQuery, setResidentQuery] = useState('');
    const [location, setLocation] = useState('');

    // Resolved Data
    const [foundPackage, setFoundPackage] = useState<PackageData | null>(null);
    const [foundResident, setFoundResident] = useState<ResidentData | null>(null);
    const [residentCandidates, setResidentCandidates] = useState<ResidentData[]>([]);

    // References for auto-focus
    const carrierInputRef = useRef<HTMLInputElement>(null);
    const internalInputRef = useRef<HTMLInputElement>(null);
    const residentInputRef = useRef<HTMLInputElement>(null);
    const locationInputRef = useRef<HTMLInputElement>(null);

    // Reset Flow - Manual Only
    const resetFlow = () => {
        setStep('scan_carrier');
        setCarrierCode('');
        setInternalCode('');
        setResidentQuery('');
        setLocation('');
        setFoundPackage(null);
        setFoundResident(null);
        setResidentCandidates([]);
        setActiveScanner(false);
    };

    // Auto-focus management
    useEffect(() => {
        if (open) {
            // Auto-focus current step input on open
            setTimeout(() => {
                if (step === 'scan_carrier') carrierInputRef.current?.focus();
                if (step === 'scan_internal') internalInputRef.current?.focus();
                if (step === 'identify_resident') residentInputRef.current?.focus();
                if (step === 'storage_location') locationInputRef.current?.focus();
            }, 100);
        }
    }, [open, step]);

    // Internal Focus Management for Scanner closing
    useEffect(() => {
        if (!activeScanner && open) {
            const timer = setTimeout(() => {
                if (step === 'scan_carrier') carrierInputRef.current?.focus();
                if (step === 'scan_internal') internalInputRef.current?.focus();
                if (step === 'identify_resident') residentInputRef.current?.focus();
                if (step === 'storage_location') locationInputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [activeScanner, step, open]);

    // --- STEP 1: SCAN CARRIER ---
    const handleCarrierSubmit = async (codeOverride?: string) => {
        const code = codeOverride || carrierCode;
        if (!code?.trim()) return;
        setLoading(true);

        try {
            const { data, error } = await supabase
                .from('packages')
                .select('*')
                .eq('original_code', code.trim())
                .eq('status', 'pending_processing')
                .single();

            if (data) {
                setFoundPackage(data);
                setCarrierCode(code.trim()); // Ensure UI matches

                // CRITICAL FIX: Close scanner FIRST, then transition
                setActiveScanner(false);
                setTimeout(() => {
                    setStep('scan_internal');
                }, 300); // Give time for scanner to unmount cleanly
            } else {
                alert('Pacote não encontrado ou já processado.');
                setCarrierCode('');
                carrierInputRef.current?.focus();
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao buscar pacote.');
        } finally {
            setLoading(false);
            scanLock.current = false; // Release lock
        }
    };

    // --- STEP 2: SCAN INTERNAL ---
    const handleInternalSubmit = (codeOverride?: string) => {
        const code = codeOverride || internalCode;
        if (!code?.trim()) {
            alert('Por favor, bipe o código interno.');
            return;
        }
        setInternalCode(code.trim());

        // CRITICAL FIX: Close scanner FIRST, then transition
        setActiveScanner(false);
        setTimeout(() => {
            setStep('identify_resident');
        }, 300); // Give time for scanner to unmount cleanly
    };

    // --- STEP 3: IDENTIFY RESIDENT ---
    // --- STEP 3: IDENTIFY RESIDENT ---
    // --- STEP 3: IDENTIFY RESIDENT ---

    // Generic Search Function
    const searchResidents = async (query: string) => {
        if (!query.trim()) {
            setResidentCandidates([]);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('id, name, unit, tower, role')
                .not('unit', 'is', null) // Only people with units
                .or(`name.ilike.%${query.trim()}%,unit.eq.${query.trim()}`)
                .limit(5);

            if (data) {
                setResidentCandidates(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Auto-search effect with debounce
    useEffect(() => {
        if (step !== 'identify_resident' || !residentQuery.trim()) {
            if (!residentQuery.trim()) setResidentCandidates([]);
            return;
        }

        const delayDebounce = setTimeout(() => {
            searchResidents(residentQuery);
        }, 300);

        return () => clearTimeout(delayDebounce);
    }, [residentQuery, step]);

    // Manual Trigger
    const handleResidentSearch = () => {
        searchResidents(residentQuery);
    };

    // Handle selection either by clicking or pressing Enter if only 1 candidate
    const handleResidentSelection = (resident: ResidentData) => {
        setFoundResident(resident);
        setResidentCandidates([]);
        setStep('storage_location');
    };

    const handleResidentEnterKey = () => {
        if (residentCandidates.length === 1) {
            handleResidentSelection(residentCandidates[0]);
        }
    };

    // --- STEP 4: STORAGE & SAVE ---
    const handleFinalize = async () => {
        if (!foundPackage || !foundResident) return;
        setLoading(true);

        try {
            const { error } = await supabase
                .from('packages')
                .update({
                    resident_id: foundResident.id,
                    unit: foundResident.unit,
                    // tower: foundResident.tower, // Column does not exist in packages table
                    internal_code: internalCode,
                    location: location,
                    status: 'pending', // Ready for pickup
                    processed_by: currentUser?.id,
                    processed_at: new Date().toISOString()
                })
                .eq('id', foundPackage.id);

            if (error) throw error;

            // --- NOTIFICATION LOGIC (FORCED) ---
            // User Request: Force send notification every time
            supabase.functions.invoke('push', {
                body: {
                    title: '📦 Chegou Encomenda!',
                    body: `Uma nova encomenda (${foundPackage.carrier_name || 'Transportadora'}) chegou para você.`,
                    target_role: 'resident',
                    target_user_id: foundResident.id,
                    icon: '/icons/package-icon.png'
                }
            }).catch(err => console.error('Push Error:', err));
            // -----------------------------------

            setStep('success');

            // Invalidate cache so pickup flow gets fresh data
            if (foundResident) {
                packagesCache.invalidate(CACHE_KEYS.RESIDENT_PACKAGES(foundResident.id));
            }

            // Auto-reset loop for high productivity
            setTimeout(() => {
                resetFlow();
            }, 1500);

        } catch (err) {
            console.error(err);
            alert('Erro ao salvar triagem.');
        } finally {
            setLoading(false);
        }
    };

    const scanLock = useRef(false);

    // --- CAMERA HANDLER ---
    const handleCameraScan = (results: any) => {
        if (results?.[0]?.rawValue && !scanLock.current) {
            const val = results[0].rawValue;

            // Lock
            scanLock.current = true;

            // Decouple execution to prevent render crash
            if (activeScanner) {
                // Prevent double scan processing
                // We don't close scanner here immediately, we let the handlers do it safely
                if (step === 'scan_carrier') {
                    handleCarrierSubmit(val);
                } else if (step === 'scan_internal') {
                    handleInternalSubmit(val);
                    setTimeout(() => { scanLock.current = false; }, 1000); // Release lock after delay
                }
            }
        }
    };

    // --- RENDER HELPERS ---

    const renderHeader = () => {
        let title = 'Triagem Rápida';
        let sub = 'Fluxo de alta produtividade';

        if (step === 'scan_carrier') { title = '1. Identificar Pacote'; sub = 'Bipe o código da transportadora'; }
        if (step === 'scan_internal') { title = '2. Vincular Etiqueta'; sub = 'Bipe o código QR Interno'; }
        if (step === 'identify_resident') { title = '3. Destinatário'; sub = 'Identifique o morador'; }
        if (step === 'storage_location') { title = '4. Armazenamento'; sub = 'Onde o pacote será guardado?'; }

        return (
            <div style={{ marginBottom: spacing.xl }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <Title level={2}>{title}</Title>
                        <Text style={{ color: colors.neutral[500] }}>{sub}</Text>
                    </div>
                </div>
            </div>
        );
    };

    const renderPackageInfo = () => {
        if (!foundPackage) return null;
        return (
            <div style={{
                padding: spacing.md,
                backgroundColor: colors.brand[50],
                borderRadius: radius.md,
                border: `1px solid ${colors.brand[200]}`,
                marginBottom: spacing.lg,
                display: 'flex',
                alignItems: 'center',
                gap: spacing.md
            }}>
                <div style={{
                    width: 40, height: 40,
                    backgroundColor: 'white',
                    borderRadius: radius.sm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: colors.brand[600]
                }}>
                    <Package size={20} />
                </div>
                <div>
                    <Text weight="bold" style={{ color: colors.brand[900] }}>
                        {foundPackage.carrier_name || 'Desconhecido'}
                    </Text>
                    <Text variant="caption" style={{ color: colors.brand[700] }}>
                        {foundPackage.original_code}
                    </Text>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                    <CheckCircle size={20} className="text-brand-500" />
                </div>
            </div>
        );
    };

    const renderResidentCandidates = () => {
        if (residentCandidates.length === 0) return null;
        return (
            <div style={{
                marginTop: spacing.md,
                backgroundColor: 'white',
                border: `1px solid ${colors.neutral[200]}`,
                borderRadius: radius.md,
                overflow: 'hidden'
            }}>
                <div style={{ padding: spacing.sm, backgroundColor: colors.neutral[50], borderBottom: `1px solid ${colors.neutral[200]}` }}>
                    <Text variant="caption" weight="bold">SELECIONE O MORADOR:</Text>
                </div>
                {residentCandidates.map(res => (
                    <div
                        key={res.id}
                        onClick={() => handleResidentSelection(res)}
                        style={{
                            padding: spacing.md,
                            cursor: 'pointer',
                            display: 'flex', justifyContent: 'space-between',
                            borderBottom: `1px solid ${colors.neutral[100]}`
                        }}
                        className="hover:bg-slate-50 transition-colors"
                    >
                        <Text weight="bold">{res.name}</Text>
                        <Text style={{ color: colors.neutral[500] }}>
                            {res.unit ? `Unit: ${res.unit}` : 'Sem Unidade'}
                        </Text>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <ErrorBoundary>
            <Sheet
                open={open}
                onClose={onClose}
                title="Triagem de Encomendas"
                subtitle="Módulo de Alta Performance"
                height="85vh"
            >
                <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', height: '100%' }}>

                    {/* --- SCANNER OVERLAY --- */}
                    {activeScanner && (
                        <div style={{
                            position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'black', display: 'flex', flexDirection: 'column'
                        }}>
                            <div style={{ position: 'relative', flex: 1, backgroundColor: 'black' }}>
                                <button
                                    onClick={() => setActiveScanner(false)}
                                    style={{
                                        position: 'absolute', top: 24, right: 24, zIndex: 50, width: 48, height: 48,
                                        backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: 'none'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                                <Scanner
                                    onScan={handleCameraScan}
                                    scanDelay={500}
                                    allowMultiple={true}
                                />
                                <div style={{ position: 'absolute', bottom: 96, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
                                    <p style={{
                                        color: 'white', fontWeight: 'bold', backgroundColor: 'rgba(0,0,0,0.5)',
                                        display: 'inline-block', padding: '12px 24px', borderRadius: 9999,
                                        fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        {step === 'scan_carrier' ? 'Bipe o Pacote da Transportadora' : 'Bipe a Etiqueta Interna'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'success' ? (
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            textAlign: 'center',
                            gap: spacing.lg
                        }}>
                            <div style={{
                                width: 100, height: 100,
                                borderRadius: '50%',
                                backgroundColor: colors.brand[50],
                                color: colors.brand[600],
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <CheckCircle size={48} />
                            </div>
                            <div>
                                <Title level={2}>Triagem Concluída!</Title>
                                <Text style={{ marginTop: spacing.sm }}>O sistema já está pronto para o próximo pacote.</Text>
                            </div>
                        </div>
                    ) : (
                        <>
                            {renderHeader()}

                            {(step !== 'scan_carrier') && renderPackageInfo()}

                            <div style={{ flex: 1 }}>
                                {/* STEP 1 INPUT */}
                                {step === 'scan_carrier' && (
                                    <DSInput
                                        ref={carrierInputRef}
                                        label="Bipe a Etiqueta da Transportadora"
                                        placeholder="Aguardando scanner..."
                                        value={carrierCode}
                                        onChange={(e) => setCarrierCode(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleCarrierSubmit()}
                                        startIcon={<Scan size={20} />}
                                        endIcon={
                                            <button
                                                onClick={() => setActiveScanner(true)}
                                                style={{
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', color: colors.brand[600], padding: 4
                                                }}
                                            >
                                                <Camera size={20} />
                                            </button>
                                        }
                                        fullWidth
                                        autoFocus
                                    />
                                )}

                                {/* STEP 2 INPUT */}
                                {step === 'scan_internal' && (
                                    <DSInput
                                        ref={internalInputRef}
                                        label="Agora, Bipe a Etiqueta Interna"
                                        placeholder="QR Code V3..."
                                        value={internalCode}
                                        onChange={(e) => setInternalCode(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleInternalSubmit()}
                                        startIcon={<Package size={20} />}
                                        endIcon={
                                            <button
                                                onClick={() => setActiveScanner(true)}
                                                style={{
                                                    border: 'none', background: 'transparent', cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', color: colors.brand[600], padding: 4
                                                }}
                                            >
                                                <Camera size={20} />
                                            </button>
                                        }
                                        fullWidth
                                        autoFocus
                                    />
                                )}

                                {/* STEP 3 INPUT */}
                                {step === 'identify_resident' && (
                                    <div>
                                        <DSInput
                                            ref={residentInputRef}
                                            label="Quem é o Dono?"
                                            placeholder="Digite nome ou unidade..."
                                            value={residentQuery}
                                            onChange={(e) => setResidentQuery(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleResidentEnterKey()}
                                            startIcon={<User size={20} />}
                                            fullWidth
                                            autoFocus
                                            // Show loading spinner if searching
                                            endIcon={loading ? <Loader2 className="animate-spin text-brand-600" size={20} /> : null}
                                        />
                                        {renderResidentCandidates()}
                                    </div>
                                )}

                                {/* STEP 4 INPUT */}
                                {step === 'storage_location' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                                        <div style={{
                                            padding: spacing.md,
                                            borderRadius: radius.md,
                                            backgroundColor: colors.neutral[50],
                                            marginBottom: spacing.lg
                                        }}>
                                            <Text variant="caption" style={{ textTransform: 'uppercase', color: colors.neutral[500] }}>Destinatário Confirmado:</Text>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
                                                <User size={18} className="text-brand-600" />
                                                <Text weight="bold" style={{ fontSize: 18 }}>{foundResident?.name}</Text>
                                            </div>
                                            <Text style={{ marginLeft: 26 }}>{foundResident?.tower} - Apto {foundResident?.unit}</Text>
                                        </div>

                                        <DSInput
                                            ref={locationInputRef}
                                            label="Onde você guardou?"
                                            placeholder="Ex: Box A, Prateleira 2, Geladeira..."
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleFinalize()}
                                            startIcon={<MapPin size={20} />}
                                            fullWidth
                                            autoFocus
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Actions Footer */}
                            <div style={{
                                borderTop: `1px solid ${colors.neutral[200]}`,
                                paddingTop: spacing.lg,
                                marginTop: spacing.xl,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                gap: spacing.md
                            }}>
                                <DSButton
                                    variant="secondary"
                                    onClick={() => {
                                        resetFlow(); // Manual Reset
                                    }}
                                >
                                    Cancelar
                                </DSButton>

                                {step === 'scan_carrier' && (
                                    <DSButton onClick={() => handleCarrierSubmit()} disabled={!carrierCode} loading={loading}>
                                        Buscar
                                    </DSButton>
                                )}
                                {step === 'scan_internal' && (
                                    <DSButton onClick={() => handleInternalSubmit()} disabled={!internalCode}>
                                        Próximo
                                    </DSButton>
                                )}
                                {step === 'identify_resident' && (
                                    <DSButton onClick={handleResidentSearch} disabled={!residentQuery} loading={loading}>
                                        Buscar Morador
                                    </DSButton>
                                )}
                                {step === 'storage_location' && (
                                    <DSButton variant="primary" onClick={handleFinalize} loading={loading} leftIcon={<CheckCircle size={18} />}>
                                        Finalizar e Salvar
                                    </DSButton>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </Sheet>
        </ErrorBoundary>
    );
};
