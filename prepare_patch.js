import { readFileSync, writeFileSync } from 'fs';

const filePath = 'pages/Resident.tsx';
const content = readFileSync(filePath, 'utf8');

// Encontrar e substituir a seção dos cards de prestadores
// Baseado no que vimos, o código está por volta da linha 948

const oldCode = `              {onSitePros.map((pro, i) => (
                <div key={i} className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
                    <img src={pro.avatar || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${pro.name}\`} className="w-full h-full object-cover" />
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Prestador</p>
                    <h4 className="font-black text-slate-900 text-xs leading-tight line-clamp-1">{pro.name || 'Prestador'}</h4>
                  </div>
                  <button
                    onClick={async () => {
                      if (pro.phone && currentUser?.id) {
                        const cleanPhone = pro.phone.replace(/\\D/g, '');
                        await supabase.from('professional_leads').insert([{
                          professional_id: pro.id,
                          resident_id: currentUser.id,
                          source: 'whatsapp_click',
                          metadata: { origin: 'home_onsite_banner' }
                        }]);
                        window.open(\`https://wa.me/55\${cleanPhone}\`, '_blank');
                      }
                    }}
                    className="mt-1 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    Chamar
                  </button>
                </div>
              ))}`;

const newCode = `              {onSitePros.map((pro, i) => (
                <div 
                  key={i} 
                  onClick={() => {
                    // Abre o perfil do prestador
                    onNavigate?.('servicos-full');
                    // TODO: Implementar navegação direta para o perfil do prestador
                  }}
                  className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 relative">
                    <img src={pro.avatar || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${pro.name}\`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{pro.category || 'Prestador'}</p>
                    <h4 className="font-black text-slate-900 text-xs leading-tight line-clamp-1">{pro.name || 'Prestador'}</h4>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation(); // Evita abrir o perfil quando clicar no botão
                      if (pro.phone && currentUser?.id) {
                        const cleanPhone = pro.phone.replace(/\\D/g, '');
                        await supabase.from('professional_leads').insert([{
                          professional_id: pro.id,
                          resident_id: currentUser.id,
                          source: 'whatsapp_click',
                          metadata: { origin: 'home_onsite_banner' }
                        }]);
                        window.open(\`https://wa.me/55\${cleanPhone}\`, '_blank');
                      } else {
                        alert('Telefone não disponível para este prestador.');
                      }
                    }}
                    className="mt-1 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
                  >
                    Chamar
                  </button>
                </div>
              ))}`;

// Tentar substituir
if (content.includes('onSitePros.map')) {
    console.log('✅ Encontrou onSitePros.map');
    console.log('⚠️  Substituição manual necessária - código muito fragmentado');
    console.log('\nVou criar um patch file com as mudanças necessárias...');
} else {
    console.log('❌ Não encontrou onSitePros.map');
}
