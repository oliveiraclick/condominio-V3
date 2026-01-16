# Integração da Página de Suporte

## Arquivo Criado
- `pages/Support.tsx` - Página completa de suporte com FAQ e contato

## Como Integrar no Perfil do Morador (Resident.tsx)

### Passo 1: Adicionar import do ícone HelpCircle
Na linha 3-11, adicione `HelpCircle` aos imports do lucide-react:

```tsx
import {
  Bell, Search, MapPin, Grid, Calendar, ShoppingBag,
  User, Plus, Package, Key, Zap, CreditCard,
  Sparkles, Star, ChevronRight, ChevronLeft, Tag, XCircle,
  Users, ArrowLeft, Filter, Droplets, Paintbrush,
  Leaf, Car, Wrench, Phone, Monitor, LayoutGrid, Scissors, Utensils,
  Coffee, ShoppingCart, HeartPulse, PawPrint, Megaphone,
  Building2, Camera as CameraIcon, Download, Scan, Handshake, BadgeCheck,
  HelpCircle  // <-- ADICIONAR ESTA LINHA
} from 'lucide-react';
```

### Passo 2: Adicionar import da página de Suporte
Após os outros imports (por volta da linha 15), adicione:

```tsx
import { SupportPage } from './Suporte';
```

### Passo 3: Adicionar item no menu do perfil
No componente `ResidentProfile` (linha ~1240), adicione o item "Central de Ajuda" no array de opções:

```tsx
<div className="p-10 space-y-4">
  {[
    { icon: <User size={20} />, label: 'Dados Pessoais', desc: 'Editar informações' },
    { icon: <HelpCircle size={20} />, label: 'Central de Ajuda', desc: 'FAQ e Suporte', action: 'support', color: 'text-brand-600', bg: 'bg-brand-50' },  // <-- ADICIONAR ESTA LINHA
    // ... outros itens
  ].map((item, idx) => (
```

### Passo 4: Adicionar handler para navegação
No componente que gerencia a navegação do Resident, adicione um case para 'support':

```tsx
// Onde você gerencia as views/páginas
{view === 'support' && (
  <SupportPage 
    onBack={() => setView('profile')} 
    onNavigateToPrivacy={() => setView('privacy')}
  />
)}
```

## Como Integrar no Perfil do Prestador (Professional.tsx)

### Passo 1: Adicionar imports
Adicione aos imports:

```tsx
import { HelpCircle } from 'lucide-react';
import { SupportPage } from './Support';
```

### Passo 2: Adicionar no menu do ProfessionalProfileView
No componente `ProfessionalProfileView` (linha ~1867), adicione um botão ou item de menu similar:

```tsx
<button
  onClick={() => onNavigate('support')}
  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm hover:bg-brand-50 transition-all"
>
  <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center">
    <HelpCircle className="text-brand-600" size={24} />
  </div>
  <div>
    <h4 className="font-bold text-slate-900">Central de Ajuda</h4>
    <p className="text-xs text-slate-400">FAQ e Suporte</p>
  </div>
  <ChevronRight className="ml-auto text-slate-300" size={20} />
</button>
```

### Passo 3: Adicionar handler de navegação
No gerenciador de views do Professional, adicione:

```tsx
{view === 'support' && (
  <SupportPage 
    onBack={() => setView('profile')} 
    onNavigateToPrivacy={() => setView('privacy')}
  />
)}
```

## Alternativa Rápida: Link Direto no Email

Se preferir uma solução mais simples, você pode apenas adicionar um link mailto no perfil:

```tsx
<a 
  href="mailto:suporte@morador.app?subject=Solicitação de Suporte"
  className="flex items-center gap-4 p-4 bg-white rounded-2xl"
>
  <HelpCircle size={24} className="text-brand-600" />
  <span>Precisa de Ajuda? Entre em Contato</span>
</a>
```

## Verificação

Após integrar, teste:
1. ✅ Link aparece no perfil
2. ✅ Ao clicar, abre a página de suporte
3. ✅ FAQ expande/colapsa corretamente
4. ✅ Botão de email funciona
5. ✅ Link para Política de Privacidade funciona
