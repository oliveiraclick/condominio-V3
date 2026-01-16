# Documentação de Criptografia - App Morador
## Para Submissão na Apple App Store

---

## ✅ RESPOSTA RÁPIDA PARA A APP STORE

**O app utiliza criptografia?** SIM

**Tipo de criptografia:** Apenas criptografia padrão HTTPS/TLS

**Requer documentação de exportação?** NÃO

---

## 📋 Respostas para o Formulário da App Store

Quando a Apple perguntar sobre criptografia durante a submissão, responda:

### 1. "Does your app use encryption?"
**Resposta:** ✅ **YES**

### 2. "Does your app qualify for any of the exemptions provided in Category 5, Part 2?"
**Resposta:** ✅ **YES**

### 3. Selecione a isenção aplicável:
**Resposta:** ✅ **"(e) Encryption limited to that within a proprietary or standardized cryptographic protocol that has been adopted by a standards body, such as HTTPS, SSL, and SSH"**

### 4. "Does your app implement any encryption algorithms that are proprietary or not accepted as standard by international standards bodies?"
**Resposta:** ❌ **NO**

### 5. "Does your app contain any encryption that is not listed in the above question?"
**Resposta:** ❌ **NO**

---

## 🔍 Análise Técnica

### Criptografia Utilizada no App

O app **App Morador** utiliza apenas criptografia padrão de comunicação HTTPS/TLS através do Supabase:

#### 1. **Supabase Authentication (HTTPS/TLS)**
- **Biblioteca:** `@supabase/supabase-js` v2.89.0
- **Uso:** Autenticação de usuários (login, registro, recuperação de senha)
- **Protocolo:** HTTPS/TLS padrão
- **Localização no código:**
  - `App.tsx` - Gerenciamento de sessões
  - `pages/Auth.tsx` - Telas de login e registro
  - `supabase.ts` - Configuração do cliente

#### 2. **Comunicação com Backend (HTTPS)**
- Todas as requisições ao Supabase usam HTTPS
- Dados transmitidos: perfis, reservas, pacotes, mensagens
- **Não há criptografia customizada ou proprietária**

#### 3. **Armazenamento Local**
- `localStorage` para cache de perfil do usuário
- **Não há criptografia de dados em repouso**
- Dados armazenados: preferências, cache de sessão

### O que NÃO é usado:
- ❌ Criptografia end-to-end customizada
- ❌ Algoritmos proprietários
- ❌ Criptografia de arquivos
- ❌ VPN ou túneis criptografados customizados
- ❌ Bibliotecas de criptografia específicas (crypto-js, bcrypt, etc.)

---

## 📄 Justificativa Legal (Category 5, Part 2)

O app se qualifica para **isenção de documentação de exportação** sob:

**ECCN (Export Control Classification Number):** 5D992

**Categoria:** Software que usa ou contém criptografia limitada a:
- Protocolos padrão de comunicação (HTTPS/SSL/TLS)
- Sem implementação de algoritmos proprietários
- Sem funcionalidades de criptografia além do transporte padrão

**Referência Legal:** 
- U.S. Export Administration Regulations (EAR)
- Category 5, Part 2 - Exemptions
- Specifically: Section (e) - Standard cryptographic protocols

---

## 🎯 Checklist para Submissão

Ao submeter o app na App Store Connect:

- [x] Marcar "Yes" para uso de criptografia
- [x] Selecionar isenção Category 5, Part 2(e)
- [x] Confirmar que usa apenas HTTPS/TLS padrão
- [x] Confirmar que NÃO usa algoritmos proprietários
- [x] **NÃO é necessário** fornecer ERN (Encryption Registration Number)
- [x] **NÃO é necessário** documentação adicional de exportação

---

## 📞 Informações de Contato (se solicitado)

**Desenvolvedor:** Oliveira Click  
**Email:** ia.oliveira.click@gmail.com  
**App ID:** com.oliveiraclick.appmorador  
**Versão:** 1.8.0  

---

## 🔗 Referências Úteis

- [Apple - Complying with Encryption Export Regulations](https://developer.apple.com/documentation/security/complying_with_encryption_export_regulations)
- [App Store Connect - Encryption Information](https://help.apple.com/app-store-connect/#/dev88f5c7bf9)
- [U.S. Bureau of Industry and Security - EAR](https://www.bis.doc.gov/index.php/policy-guidance/encryption)

---

## ✨ Resumo Executivo

**O App Morador usa apenas criptografia padrão HTTPS/TLS para comunicação segura com o backend Supabase. Não implementa nenhuma criptografia customizada ou proprietária, qualificando-se automaticamente para isenção de documentação de exportação sob Category 5, Part 2(e) das regulamentações dos EUA.**

**Ação necessária:** Apenas marcar as opções corretas no formulário da App Store - nenhuma documentação adicional é necessária.

---

**Documento gerado em:** Janeiro 2026  
**Para:** Submissão iOS App Store  
**Status:** ✅ Pronto para uso
