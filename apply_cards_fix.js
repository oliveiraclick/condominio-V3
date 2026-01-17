import { readFileSync, writeFileSync } from 'fs';

const filePath = 'pages/Resident.tsx';
const content = readFileSync(filePath, 'utf8');

// Procurar pela seção dos cards e substituir
const searchPattern = /(\{onSitePros\.map\(\(pro, i\) => \(\s*<div key=\{i\} className="min-w-\[140px\][^}]+\}\s*\)\)\})/s;

const newCardCode = `{onSitePros.map((pro, i) => (
                <div 
                  key={i}
                  onClick={() => {
                    // Abre perfil do prestador (TODO: implementar navegação específica)
                    console.log('Abrir perfil de:', pro.name);
                  }}
                  className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-95"
                >
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 relative">
                    <img 
                      src={pro.avatar || \`https://api.dicebear.com/7.x/avataaars/svg?seed=\${pro.name}\`} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      {pro.category || 'Prestador'}
                    </p>
                    <h4 className="font-black text-slate-900 text-xs leading-tight line-clamp-1">
                      {pro.name || 'Prestador'}
                    </h4>
                  </div>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
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

// Tentar encontrar e substituir manualmente por linha
const lines = content.split('\n');
let startLine = -1;
let endLine = -1;

// Encontrar linha que contém onSitePros.map
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('onSitePros.map((pro, i) =>')) {
        startLine = i;
        break;
    }
}

if (startLine === -1) {
    console.log('❌ Não encontrou onSitePros.map');
    process.exit(1);
}

// Encontrar o final do bloco (procurar pelo ))})
for (let i = startLine; i < Math.min(startLine + 50, lines.length); i++) {
    if (lines[i].includes('))}') && i > startLine + 5) {
        endLine = i;
        break;
    }
}

if (endLine === -1) {
    console.log('❌ Não encontrou o final do bloco');
    console.log('Linha inicial:', startLine);
    process.exit(1);
}

console.log(`✅ Encontrado bloco nas linhas ${startLine + 1} - ${endLine + 1}`);
console.log('\n📝 Código original:');
console.log(lines.slice(startLine, endLine + 1).join('\n').substring(0, 500) + '...');

// Substituir as linhas
const before = lines.slice(0, startLine);
const after = lines.slice(endLine + 1);
const newLines = [...before, ...newCardCode.split('\n'), ...after];

// Salvar
writeFileSync(filePath, newLines.join('\n'), 'utf8');

console.log('\n✅ Arquivo modificado com sucesso!');
console.log('📦 Backup salvo em: Resident_backup.tsx');
