# Changelog

## [v1.6.1] - 2026-01-08
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
