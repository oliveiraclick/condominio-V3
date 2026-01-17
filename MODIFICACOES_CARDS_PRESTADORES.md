# Modificações Necessárias - Cards de Prestadores

## 📍 Localização
**Arquivo:** `pages/Resident.tsx`  
**Linha:** ~948 (busque por `onSitePros.map`)

---

## 🎯 Modificações a Fazer

### 1. Adicionar onClick no Card (para abrir perfil)

**Encontre o código que começa com:**
```tsx
<div key={i} className="min-w-[140px] bg-white p-4 rounded-[24px]...
```

**Adicione:**
- `onClick={() => { /* navegar para perfil */ }}`
- `cursor-pointer` na className
- `hover:shadow-md transition-all active:scale-95` na className

### 2. Botão CHAMAR - Adicionar stopPropagation

**No botão "Chamar", adicione:**
```tsx
onClick={async (e) => {
  e.stopPropagation(); // IMPORTANTE: evita abrir perfil ao clicar no botão
  // ... resto do código
}}
```

### 3. Corrigir Acentos

**Procure por:**
- `Condom�nio` → Trocar por `Condomínio`
- `Avalia��o` → Trocar por `Avaliação`
- Qualquer outro caractere estranho

---

## ✅ Código Completo Sugerido

```tsx
{onSitePros.map((pro, i) => (
  <div 
    key={i}
    onClick={() => {
      // TODO: Implementar navegação para perfil do prestador
      console.log('Abrir perfil de:', pro.name);
    }}
    className="min-w-[140px] bg-white p-4 rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center gap-3 cursor-pointer hover:shadow-md transition-all active:scale-95"
  >
    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 relative">
      <img 
        src={pro.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${pro.name}`} 
        className="w-full h-full object-cover" 
      />
      {/* Indicador verde "online" */}
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
        e.stopPropagation(); // Evita abrir perfil ao clicar no botão
        
        if (pro.phone && currentUser?.id) {
          const cleanPhone = pro.phone.replace(/\D/g, '');
          
          // Registra lead
          await supabase.from('professional_leads').insert([{
            professional_id: pro.id,
            resident_id: currentUser.id,
            source: 'whatsapp_click',
            metadata: { origin: 'home_onsite_banner' }
          }]);
          
          // Abre WhatsApp
          window.open(`https://wa.me/55${cleanPhone}`, '_blank');
        } else {
          alert('Telefone não disponível para este prestador.');
        }
      }}
      className="mt-1 w-full py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
    >
      Chamar
    </button>
  </div>
))}
```

---

## 📝 Checklist

- [ ] Adicionar `onClick` no card principal
- [ ] Adicionar `cursor-pointer` e efeitos hover
- [ ] Adicionar `e.stopPropagation()` no botão CHAMAR
- [ ] Adicionar indicador verde "online" (bolinha)
- [ ] Mostrar categoria do prestador ao invés de "Prestador"
- [ ] Adicionar alert se telefone não disponível
- [ ] Corrigir todos os acentos no arquivo

---

## 🔍 Como Encontrar

1. Abra `pages/Resident.tsx`
2. Pressione `Ctrl+F`
3. Busque por: `onSitePros.map`
4. Substitua o bloco completo pelo código acima
