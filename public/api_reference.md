# Documentação da API - Condo V3

## Visão Geral
O sistema utiliza uma API RESTful segura, gerada automaticamente pelo Supabase. Todas as requisições devem ser feitas via HTTPS.

**Base URL:** `https://<SEU_PROJETO>.supabase.co/rest/v1`

---

## Autenticação
Para acessar os dados, é necessário enviar o **Token de Acesso** no cabeçalho da requisição.

**Header:**
```http
apikey: <SUA_PUBLIC_ANON_KEY>
Authorization: Bearer <USUARIO_ACCESS_TOKEN>
```
*Para integrações de servidor (Backend/Câmeras), use a `SERVICE_ROLE_KEY` no lugar do token do usuário.*

---

## Endpoints Principais

### 1. Perfis (Usuários)
Listar todos os moradores de um condomínio.
`GET /profiles?select=*,condominiums(name)&role=eq.resident`

### 2. Condomínios
Obter dados do condomínio (Cores, Logo).
`GET /condominiums?id=eq.<CONDO_UUID>`

### 3. Logs de Acesso (Câmeras/Portaria)
Registrar uma entrada.
`POST /access_logs`
```json
{
  "device_id": "uuid-do-dispositivo",
  "event_type": "entry_granted",
  "auth_method": "facial",
  "user_id": "uuid-do-morador",
  "snapshot_url": "https://..."
}
```

### 4. Dispositivos de Acesso
Listar câmeras cadastradas.
`GET /access_devices?status=eq.active`

---

## Filtros e Paginação
A API suporta filtros poderosos estilo PostgREST:
*   `?id=eq.123` (Igual a)
*   `?price=gt.100` (Maior que)
*   `?limit=20&offset=0` (Paginação)
*   `?order=created_at.desc` (Ordenação)

---

## Webhooks (Realtime)
Para receber eventos em tempo real (ex: nova encomenda), conecte-se via WebSocket no canal `realtime`.
