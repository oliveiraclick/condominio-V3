# Integração de Controle de Acesso (Hikvision / Control iD)

Este documento descreve a arquitetura técnica para integrar o sistema **Condo V3** com hardwares físicos de controle de acesso (Câmeras Faciais, Leitoras de Tag, etc.), superando a barreira de NAT/Firewall dos condomínios.

## 1. Arquitetura da Solução

O sistema utiliza um modelo de **Agente Local (Bridge)** para garantir segurança e resiliência.

```mermaid
graph LR
    A[Condo V3 (Nuvem)] <-->|Supabase API| B[Agente Local (PC Portaria)]
    B <-->|Protocolo ISAPI/SDK| C[Equipamentos Hikvision]
```

### Por que esse modelo?
1.  **Segurança**: Não precisamos expor portas do condomínio na internet (sem Port Forwarding).
2.  **Resiliência**: Se a internet cair, o Agente Local continua operando com o cache local da câmera.
3.  **Compatibilidade**: O Agente traduz os comandos complexos da Hikvision para chamadas simples de API.

---

## 2. Pré-requisitos (No Local)

1.  **Computador da Portaria**:
    *   Windows 10/11 ou Linux.
    *   Node.js instalado (v18+).
    *   Acesso à rede local onde estão as câmeras.
2.  **Equipamentos**:
    *   Hikvision MinMoe (Face Recognition Terminal) ou similar.
    *   IP fixo na rede local para cada dispositivo (ex: `192.168.1.200`).

---

## 3. Instalação e Configuração

### Passo A: Criar Usuário de Serviço (Cloud)
No painel do Supabase, precisamos pegar a chave `SERVICE_ROLE_KEY`. Essa chave será usada **apenas** pelo Agente Local para ter permissão de ler/escrever logs de acesso, ignorando as restrições normais de usuários.

### Passo B: Configurar o Agente (Local)
O Agente é um script Node.js que roda em background.
1.  Clone o repositório do Agente (a ser criado em `tools/access-bridge`).
2.  Crie um arquivo `.env` no Agente:
    ```env
    SUPABASE_URL=https://seu-projeto.supabase.co
    SUPABASE_SERVICE_KEY=sua-chave-service-role-super-secreta
    CONDO_ID=uuid-do-condominio-local
    DEVICE_IP=192.168.1.200
    DEVICE_USER=admin
    DEVICE_PASS=senha_da_camera
    ```

### Passo C: Rodar o Serviço
`npm start`

O Agente fará duas coisas:
1.  **Escutar Eventos (Polling/Realtime)**: "O usuário João (ID 123) mudou a foto?". Se sim, `PUT /ISAPI/Intelligent/FDLib/FaceDataRecord` na câmera.
2.  **Escutar Acessos (Webhook Server)**: A câmera manda um POST para o Agente quando alguém entra. O Agente manda um `INSERT INTO access_logs` para o Supabase.

---

## 4. Estrutura de Dados (Já Criada)

O banco já está pronto com as tabelas:
*   `access_devices`: Cadastro das câmeras.
*   `access_logs`: Histórico de quem entrou.
*   `profiles.sync_status`: Flag para saber quem precisa ser enviado para a câmera.

## 5. Próximos Passos de Desenvolvimento

1.  Criar o script do Agente (`tools/agent-hikvision.js`).
2.  Configurar o Supabase Realtime para notificar o Agente de mudanças imediatas.
3.  Testar o fluxo de "Sincronização Forçada" (Botão no Painel Admin -> Enviar Todos).
