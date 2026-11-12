# Proposal: UC-01-S1 — Registo de pedido de acompanhamento

## Why
O utente sénior, ou o seu familiar/cuidador, precisa de pedir um acompanhamento a uma consulta ou exame indicando destino, data/hora e necessidades de mobilidade, para chegar em segurança sem depender de terceiros. Sem um registo fiável e validado, a coordenação e os voluntários não sabem que pedidos existem nem que perfil de mobilidade exigem, bloqueando todo o fluxo de mobilidade assistida.

## What Changes
- Registo de pedido com seleção do requerente (próprio utente ou familiar/cuidador).
- Pesquisa e seleção da unidade de saúde de destino a partir do catálogo de unidades.
- Indicação da data e hora da consulta e das necessidades de mobilidade (cadeira de rodas, oxigénio, défice cognitivo, acompanhante, bengala, maca ou cuidados).
- Validação dos campos obrigatórios, da antecedência mínima de 24 horas (BR-01) e da compatibilidade do perfil de mobilidade (BR-02).
- Criação do pedido no estado «A escolher o meio», associado ao perfil de mobilidade do utente.
- Notificação da coordenação e disponibilização do pedido às opções de transporte compatíveis (UC-02).
- Interface mobile-first acessível, com letra grande, bom contraste e poucos passos por ecrã (RNF-01).
- Minimização e proteção dos dados pessoais recolhidos no pedido (BR-11, RNF-06).

## Capabilities

### New Capabilities
- `trip-request`: Registo e validação do pedido de acompanhamento a consulta, incluindo requerente, destino, data/hora, necessidades de mobilidade e criação do pedido no estado «A escolher o meio».

### Modified Capabilities
<!-- Sem alterações a requisitos de capacidades existentes: o projeto ainda não tem specs principais. -->

## Impact
- Novo modelo `TripRequest` com requerente, utente, destino, data/hora da consulta, perfil de mobilidade, estado (`A_ESCOLHER_O_MEIO` inicial) e autor do registo.
- Catálogo de unidades de saúde de destino e associação ao pedido.
- Validação de antecedência mínima de 24h (BR-01) e de compatibilidade de mobilidade (BR-02).
- Novo ecrã mobile-first «Pedir acompanhamento» na aplicação do utente/familiar, com os passos do fluxo básico.
- Integração com a notificação à coordenação e com a apresentação de opções compatíveis no UC-02.
- Controlo de acesso por perfil e minimização de dados (BR-11, RNF-06).
- Fora de âmbito desta slice: recorrência semanal e destino não listado (UC-01-S2), triagem TNUD/Táxi Municipal, encaminhamento telefónico e resiliência offline do pedido (UC-01-S3).
