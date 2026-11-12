# Tasks

## 1. Modelo de Dados e Rastreabilidade

- [ ] 1.1 Adicionar campos de recolha (`pickup_at`, `pickup_coords`, `pickup_method`) ao modelo `Trip` e verificar que a migração cria as colunas
- [ ] 1.2 Criar modelo `CheckInEvent` com `timestamp`, `geo_lat`, `geo_long` e `method` e verificar a persistência de cada método (`QR`, `NFC`, `MANUAL`) em teste unitário
- [ ] 1.3 Configurar as transições de estado da viagem (`ASSIGNED` → `IN_TRANSIT` → `PICKUP_DONE` | `NO_SHOW`) e verificar que transições inválidas são rejeitadas

## 2. Interface Móvel do Voluntário

- [ ] 2.1 Criar ecrã de detalhe da viagem com morada, hora e requisitos de mobilidade (BR-02) e verificar a renderização responsiva em viewport móvel
- [ ] 2.2 Implementar «Iniciar Viagem» com verificação de compatibilidade (BR-02) e registo de geolocalização e verificar o cenário TC-UC03-03
- [ ] 2.3 Implementar leitor QR/NFC do cartão físico MobiCare com fallback para câmara e verificar a leitura de um cartão de teste
- [ ] 2.4 Desenvolver modal de contingência manual (número do cartão + justificação) e verificar o cenário TC-UC03-04
- [ ] 2.5 Implementar temporizador de tolerância de 10 minutos e ação «Reportar Ausência» e verificar o cenário TC-UC03-02

## 3. Resiliência Offline e Notificações

- [ ] 3.1 Persistir eventos de check-in em `IndexedDB` com carimbo temporal e verificar que sobrevivem ao fecho da aplicação
- [ ] 3.2 Sincronizar eventos de check-in quando a ligação é restabelecida, com idempotência, e verificar que reenvios não duplicam eventos (RNF-05)
- [ ] 3.3 Integrar envio de notificação/SMS ao familiar no check-in e verificar que o check-in não é revertido se o envio falhar

## 4. Validação e Testes

- [ ] 4.1 Implementar testes unitários para os cenários TC-UC03-01, TC-UC03-02, TC-UC03-03 e TC-UC03-04 e verificar que a suite passa
- [ ] 4.2 Implementar teste de integração do fluxo offline → sincronização → estado `PICKUP_DONE` e verificar a consistência no servidor
