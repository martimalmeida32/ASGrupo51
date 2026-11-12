# Design: UC-03-S1

## Context

Ver `proposal.md` para a motivação e `specs/trip-execution/spec.md` para os requisitos. O fluxo ocorre no dispositivo móvel do voluntário, muitas vezes em locais com rede instável, e tem de validar um cartão físico MobiCare por QR/NFC. A aplicação é mobile-first e offline-first, sincronizando eventos de check-in quando a ligação é restabelecida (RNF-05). O modelo `Trip` já existe; esta capacidade acrescenta o estado de recolha e os eventos de check-in.

## Goals / Non-Goals

**Goals:**
- Registar início de viagem e check-in com timestamp e coordenadas, mesmo com rede intermitente.
- Validar a compatibilidade de mobilidade antes de permitir o início (BR-02).
- Garantir contingência quando QR/NFC falha e tratar a ausência do utente aos 10 minutos.
- Manter a viagem e os eventos de check-in rastreáveis e auditáveis.

**Non-Goals:**
- Alterar a cascata de atribuição de viagens ou o perfil de compatibilidade (BR-02) — apenas consumidos.
- Implementar notificações de fim de viagem ou avaliação do serviço.
- Suportar cartões de outros operadores para além do cartão físico MobiCare.

## Decisions

1. **Leitura QR/NFC no cliente com fallback progressivo.**
   Usar Web NFC em browsers compatíveis, fallback para leitura por câmara (HTML5 QR Scanner) e, por último, confirmação manual com o número do cartão e justificação. *Alternativa considerada:* exigir um leitor dedicado — rejeitada por custo e por excluir dispositivos comuns dos voluntários.

2. **Eventos de check-in persistidos localmente com sincronização.**
   Em quebra de rede, o evento é gravado em `IndexedDB` com carimbo temporal e enviado quando a conectividade regressa (RNF-05). O servidor aplica idempotência por `trip_id` + `method` + timestamp para evitar duplicados. *Alternativa considerada:* bloquear o check-in sem rede — rejeitada por impedir a operação no terreno.

3. **Máquina de estados da viagem.**
   `ASSIGNED` → `IN_TRANSIT` no início; depois `PICKUP_DONE` no check-in ou `NO_SHOW` após ausência reportada. Transições inválidas são rejeitadas no servidor. *Alternativa considerada:* estados livres no cliente — rejeitada por permitir inconsistências.

4. **Temporizador de 10 minutos gerido no cliente e confirmado no servidor.**
   A contagem começa na hora agendada de recolha no dispositivo e é confirmada com o servidor ao reportar ausência; o alerta à IPSS e ao familiar é disparado pelo servidor para garantir entrega. *Alternativa considerada:* contagem só no servidor — rejeitada por depender de rede no momento crítico.

5. **Notificação ao familiar no check-in.**
   O check-in bem-sucedido emite um evento que desencadeia a notificação/SMS ao familiar registado; a falha de envio não deve reverter o check-in. *Alternativa considerada:* notificação síncrona bloqueante — rejeitada por acoplar a operação principal a um serviço externo.

## Risks / Trade-offs

- **Web NFC não suportado em muitos dispositivos** → fallback para QR e confirmação manual garantem a operação.
- **Eventos duplicados após sincronização** → idempotência por `trip_id` + `method` + timestamp e reconciliação no servidor.
- **Relógio do dispositivo desviado** → registar timestamp do cliente e timestamp de receção no servidor, sinalizando divergências.
- **Alerta de ausência não entregue** → retry no servidor e registo de falha para intervenção da central.
- **Check-in manual abusado** → justificação obrigatória e registo de auditoria com método `MANUAL`.
