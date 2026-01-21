# Changelog

## [2.3.5] - 2026-01-21

### Corrigido
- **Scanner de Encomendas**: Corrigido erro de permissão que bloqueava a retirada por vizinhos autorizados. Migração para RPC segura implementada.
- **Controle de Acesso**: Adicionada aba "Encomendas" na tela de Acessos, permitindo autorizar vizinhos para retirada de pacotes na portaria/locker.
- **Privacidade**: Ajuste nas views de notificação para garantir sigilo das mensagens de chegada de encomendas.
- **Refatoração**: Correção de códigos duplicados na tela `Resident.tsx` que causavam instabilidade no build.
- **Navegação**: Correção no botão "Voltar" da tela de "Ver Tudo" no Desapego.

### Atualizado
- Versão do App Android bumped para **2.3.5 (235)**.
- Versão do App iOS bumped para **2.3.5 (235)**.
- Dependências do projeto sincronizadas.
