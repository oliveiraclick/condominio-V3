import { readFile, writeFile } from 'fs/promises';

const NOTIFICATIONS_MODAL_NEW = `// --- NOTIFICATIONS MODAL ---
export const NotificationsModal: React.FC<{ isOpen: boolean; onClose: () => void; notifications: any[]; loading: boolean; markAsRead: (id: string) => void }> = ({ isOpen, onClose, notifications, loading, markAsRead }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-[40px] shadow-2xl animate-in slide-in-from-bottom-8 duration-300 pb-24" style={{ maxHeight: 'calc(100vh - 120px)' }}>
        {/* Header */}
        <div className="p-6 pb-4 border-b border-white/5 sticky top-0 bg-slate-900/95 backdrop-blur-md rounded-t-[40px] z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black italic text-white tracking-tighter">Notificações</h2>
            <button onClick={onClose} className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center active:scale-90 transition-all border border-white/10">
              <X size={20} className="text-white" />
            </button>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
            {notifications.length} mensagens
          </p>
        </div>

        {/* Content with smooth scroll */}
        <div
          className="overflow-y-auto p-6 space-y-4"
          style={{
            maxHeight: 'calc(100vh - 280px)',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <style>{\`
            .overflow-y-auto::-webkit-scrollbar {
              display: none;
            }
          \`}</style>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
                <Bell size={24} className="text-slate-500" />
              </div>
              <p className="text-slate-400 font-bold text-sm">Nenhuma notificação</p>
              <p className="text-slate-500 text-xs mt-1">Você está em dia!</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div key={notif.id} className="bg-white/5 backdrop-blur-sm p-5 rounded-[28px] border border-white/10 space-y-3 animate-in slide-in-from-bottom-2 relative group">
                <div className="flex justify-between items-start gap-3">
                  <h4 className="font-black text-white text-base italic tracking-tight flex-1">{notif.title}</h4>
                  <Badge className={\`text-[8px] uppercase px-2 py-1 \${notif.target_role === 'all' ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20' :
                    notif.target_role === 'resident' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }\`}>
                    {notif.target_role === 'all' ? 'Geral' : notif.target_role === 'resident' ? 'Moradores' : 'Profissionais'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">{notif.body}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <Clock size={12} />
                    {new Date(notif.created_at).toLocaleDateString('pt-BR')} às {new Date(notif.created_at).toLocaleTimeString('pt-BR').slice(0, 5)}
                  </div>
                  <button
                    onClick={() => markAsRead(notif.id)}
                    className="text-[10px] font-black uppercase text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1.5 rounded-lg hover:bg-brand-500/20 active:scale-95 transition-all opacity-0 group-hover:opacity-100"
                  >
                    Marcar Lido
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};`;

const AUTHORIZATION_MODAL_NEW = `// --- AUTHORIZATION MODAL ---
export const AuthorizationModal: React.FC<{ isOpen: boolean; onClose: () => void; currentUser: any }> = ({ isOpen, onClose, currentUser }) => {
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [manualEntry, setManualEntry] = useState({ tower: '', unit: '' }); // Changed to manual entry
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAuthorizations();
    }
  }, [isOpen]);

  const loadAuthorizations = async () => {
    const { data } = await supabase
      .from('package_authorizations')
      .select('*, grantee:grantee_id(id, name, unit, tower)')
      .eq('grantor_id', currentUser.id)
      .eq('status', 'active');

    if (data) setAuthorizations(data);
  };

  const authorizeByAddress = async () => {
    if (!manualEntry.tower || !manualEntry.unit) {
      alert('Preencha Rua e Casa!');
      return;
    }

    setLoading(true);

    try {
      // 1. Find the neighbor by address
      const { data: neighbors } = await supabase
        .from('profiles')
        .select('id, name, unit, tower')
        .eq('role', 'resident')
        .eq('tower', manualEntry.tower)
        .eq('unit', manualEntry.unit)
        .neq('id', currentUser.id); // Cannot authorize self

      if (!neighbors || neighbors.length === 0) {
        alert('Morador não encontrado neste endereço.');
        setLoading(false);
        return;
      }

      // If multiple people live there (e.g. husband/wife), we authorize ALL of them or just ask user?
      // For simplicity/security, let's authorize the first one found or handled better.
      // Actually, typically we authorize a specific person, but here we can authorize the first valid profile found at that address.
      // Let's list found residents if > 1, or just pick the first.

      const neighbor = neighbors[0]; // Picking the first verified resident at that address

      // 2. Check overlap
      const exists = authorizations.find(a => a.grantee_id === neighbor.id);
      if (exists) {
        alert(\`O morador \${neighbor.name} (Rua \${neighbor.tower} - \${neighbor.unit}) já está autorizado.\`);
        setLoading(false);
        return;
      }

      // 3. Insert Authorization
      const { error } = await supabase.from('package_authorizations').insert([{
        grantor_id: currentUser.id,
        grantee_id: neighbor.id,
        status: 'active'
      }]);

      if (error) throw error;

      alert(\`Autorizado com sucesso: \${neighbor.name}\`);
      setManualEntry({ tower: '', unit: '' });
      loadAuthorizations();

    } catch (err: any) {
      alert('Erro ao autorizar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const revokeAuthorization = async (id: string) => {
    await supabase.from('package_authorizations').update({ status: 'revoked' }).eq('id', id);
    loadAuthorizations();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-t-[40px] p-8 pb-12 shadow-2xl animate-in slide-in-from-bottom-8">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black italic text-white">Vizinhos Autorizados</h3>
          <button onClick={onClose}><XCircle size={32} className="text-slate-500" /></button>
        </div>

        <div className="bg-white/5 p-6 rounded-[32px] mb-8 space-y-4 border border-white/10">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Adicionar Novo</h4>

          <div className="flex gap-2 items-end">
            <div className="space-y-2 flex-1">
              <Input
                placeholder="Rua (Ex: 1)"
                value={manualEntry.tower}
                onChange={e => setManualEntry({ ...manualEntry, tower: e.target.value })}
                className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-600"
              />
            </div>
            <div className="space-y-2 flex-1">
              <Input
                placeholder="Casa (Ex: 460)"
                value={manualEntry.unit}
                onChange={e => setManualEntry({ ...manualEntry, unit: e.target.value })}
                className="h-12 bg-slate-900 border-white/10 text-white placeholder:text-slate-600"
              />
            </div>
            <Button onClick={authorizeByAddress} disabled={loading} className="h-12 w-14 bg-brand-500 hover:bg-brand-400 text-primary-foreground rounded-xl flex items-center justify-center shadow-brand-500/20 shadow-lg active:scale-95 transition-all">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={24} strokeWidth={3} />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 mb-2">Autorizações Ativas</h4>
          {authorizations.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-xs italic">Ninguém autorizado.</p>
            </div>
          ) : (
            authorizations.map(auth => (
              <div key={auth.id} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl shadow-sm">
                <div>
                  <h5 className="font-bold text-white text-sm">{auth.grantee?.name}</h5>
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">RUA {auth.grantee?.tower}, {auth.grantee?.unit}</p>
                </div>
                <button onClick={() => revokeAuthorization(auth.id)} className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2 rounded-xl active:scale-95 hover:bg-rose-500/20 transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};`;

const REVIEW_MODAL_NEW = `// --- HOME DO MORADOR ---
// --- REVIEW MODAL ---
export const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (rating: number, comment: string) => void; proName: string }> = ({ isOpen, onClose, onSubmit, proName }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 mx-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-brand-500/10 text-brand-400 border border-brand-500/20 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Star size={32} fill="currentColor" />
          </div>
          <h3 className="text-2xl font-black text-white italic tracking-tighter">Avaliar Serviço</h3>
          <p className="text-sm text-slate-400">Como foi o atendimento de <span className="font-bold text-white">{proName}</span>?</p>

          <div className="flex justify-center gap-2 py-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} onClick={() => setRating(s)} className="active:scale-90 transition-transform">
                <Star size={32} className={s <= rating ? "text-amber-400 fill-amber-400" : "text-slate-700"} />
              </button>
            ))}
          </div>

          <textarea
            placeholder="Deixe um comentário (opcional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full h-24 bg-white/5 border border-white/10 text-white rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-amber-400 transition-all font-medium placeholder:text-slate-500"
          />

          <Button onClick={() => onSubmit(rating, comment)} fullWidth className="h-14 bg-amber-400 text-amber-950 font-black uppercase tracking-widest shadow-lg shadow-amber-400/30 hover:bg-amber-500 hover:text-white">
            Enviar Avaliação
          </Button>
          <button onClick={onClose} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-white">Cancelar</button>
        </div>
      </div>
    </div>
  );
};`;

async function run() {
    const filePath = './pages/Resident.tsx';
    let content = await readFile(filePath, 'utf-8');

    // 1. NOTIFICATIONS
    const startNotif = content.indexOf('export const NotificationsModal');
    const endNotif = content.indexOf('// --- AUTHORIZATION MODAL ---');

    if (startNotif === -1 || endNotif === -1) {
        console.error('Could not find NotificationsModal boundaries');
    } else {
        content = content.substring(0, startNotif) + NOTIFICATIONS_MODAL_NEW + '\\n\\n' + content.substring(endNotif);
    }

    // 2. AUTHORIZATION
    const startAuth = content.indexOf('export const AuthorizationModal');
    const endAuth = content.indexOf('export const DigitalIDModal');

    if (startAuth === -1 || endAuth === -1) {
        console.error('Could not find AuthorizationModal boundaries');
    } else {
        content = content.substring(0, startAuth) + AUTHORIZATION_MODAL_NEW + '\\n\\n' + content.substring(endAuth);
    }

    // 3. REVIEW MODAL
    const startReview = content.indexOf('export const ReviewModal');
    const endReview = content.indexOf('export const ProfessionalDetailModal');

    if (startReview === -1 || endReview === -1) {
        console.error('Could not find ReviewModal boundaries');
    } else {
        content = content.substring(0, startReview) + REVIEW_MODAL_NEW + '\\n\\n' + content.substring(endReview);
    }

    await writeFile(filePath, content, 'utf-8');
    console.log('Done');
}

run();
