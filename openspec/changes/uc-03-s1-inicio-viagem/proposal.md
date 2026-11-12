# Proposal: UC-03-S1 — Início de viagem e check-in à porta do utente

## Why
O voluntário precisa de saber que viagem lhe está atribuída, registar o início da deslocação até ao domicílio do utente e comprovar presencialmente a recolha, para que a viagem e o acompanhamento fiquem rastreáveis e seguros. Sem este fluxo, a recolha não tem validação física nem registo de hora/local, comprometendo a confiança da IPSS e das famílias.

## What Changes
- Consulta dos detalhes da viagem atribuída e do perfil de mobilidade do utente, com verificação de compatibilidade (BR-02).
- Registo do início da viagem com timestamp e coordenadas GPS.
- Check-in presencial no domicílio através da leitura do cartão físico MobiCare por QR/NFC.
- Mecanismo de contingência manual (número do cartão + justificação) quando a leitura física falha.
- Temporizador de tolerância de 10 minutos para ausência do utente, com alerta automático à central da IPSS e ao contacto de emergência do familiar, libertando o voluntário sem penalização.
- Notificação ao familiar registado quando o check-in de recolha é concluído.
- Persistência offline dos eventos de check-in com sincronização automática quando a ligação é restabelecida (RNF-05).

## Capabilities

### New Capabilities
- `trip-execution`: Início de deslocação e validação de recolha porta-a-porta do utente, incluindo check-in por QR/NFC, contingência manual e tolerância de ausência.

### Modified Capabilities
<!-- Sem alterações a requisitos de capacidades existentes: o projeto ainda não tem specs principais. -->

## Impact
- Atualização do modelo `Trip` com campos de recolha (`pickup_at`, `pickup_coords`, `pickup_method`) e transições de estado (`ASSIGNED` → `IN_TRANSIT` → `PICKUP_DONE` | `NO_SHOW`).
- Novo modelo `CheckInEvent` com `timestamp`, `geo_lat`, `geo_long` e `method` (`QR` | `NFC` | `MANUAL`).
- Novo ecrã mobile-first de detalhe da viagem e check-in na aplicação do voluntário, com Web NFC, fallback para leitura por câmara (QR) e confirmação manual.
- Persistência local em `IndexedDB` com carimbo temporal e sincronização automática de eventos (RNF-05).
- Integração com notificações/SMS ao familiar e com o fluxo de alerta à central da IPSS em caso de ausência.
