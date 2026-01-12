# Changelog

## [v1.7.2] - 2026-01-11
### Fixed
- **E-Shop & Desapego & Fornecedores**: Garantindo a exibição dos cadastros no domínio morador.app.
- **Version Consistency**: Sincronização de versão para v1.7.2 em todo o projeto.
### Added (Visual Polish)
- **Toast Notifications**: Substituídos alertas nativos por sistema de Toasts (popups) elegantes.
- **Skeleton Loaders**: Adicionado carregamento esqueleto para Mural e Leads (aspecto premium).
- **Staggered Animations**: Itens de lista agora entram em cascata suave.
- **Clean UI**: Layout do Profissional atualizado para estilo "Clean & Floating" (sem bordas, sombras suaves, raio 24px) para paridade com o App Morador.

## [v1.7.1] - 2026-01-11
### Fixed
- **E-Shop & Desapego Display**: Corrigido problema onde produtos não apareciam.
- **Navigation Routes**: Adicionadas rotas faltantes no `App.tsx` (shop-detail, create-desapego, etc.).
- **Mobile Crash**: Mantida a correção para evitar tela branca no mobile (Provider mismatch).
- **Data Mapping**: Corrigido mapeamento de dados do Supabase para o Frontend (`image_url` -> `img`, etc.).

### Added
- **Version Display**: Adicionado número da versão (v1.6.1) na tela de Login e no Menu do App.
- **CRUD Handlers**: Restauradas funções para criar/deletar produtos e desapegos.

## [v1.6.0] - 2026-01-08
- Versão inicial com tentativa de correção do Mobile Crash.
