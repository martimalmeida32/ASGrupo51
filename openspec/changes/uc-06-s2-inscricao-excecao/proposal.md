# Proposal: UC-06-S2 — Inscrição inicial, destino manual e exceção de urgência

## Why
Muitos utentes seniores chegam ao balcão da Junta/IPSS sem qualquer registo e com consultas marcadas para as 24 horas seguintes, ou para unidades de saúde que não constam da lista. Sem inscrição inicial com cartão físico e sem uma exceção de urgência justificada, o técnico social não consegue registar o pedido e o utente perde o acompanhamento. Esta slice completa o registo telefónico com os fluxos alternativos A0, A2, A3 e A4.

## What Changes
- Inscrição inicial presencial com criação da ficha do utente usando apenas os dados mínimos obrigatórios (BR-11) e emissão de cartão físico MobiCare com QR/NFC e número único (A0).
- Marcação da primeira viagem do novo utente como acompanhamento garantido.
- Introdução manual de um destino não constante da lista, aceite como «destino não listado» e sinalizado para validação pela coordenação (A2).
- Autorização justificada de pedidos urgentes com menos de 24 horas de antecedência, com justificação obrigatória, registo de auditoria e avanço para atribuição do meio (A3, BR-01).
- Encaminhamento informativo para o TNUD e o Táxi Municipal, com registo da decisão do utente (A4, BR-10).

## Capabilities

### New Capabilities
- `telephone-request`: Registo assistido de pedidos por telefone, agora com inscrição inicial e cartão físico, destinos não listados, exceções de urgência justificadas e encaminhamento para apoios públicos.

### Modified Capabilities
<!-- Sem alterações a specs principais: o projeto ainda não tem specs principais. -->

## Impact
- Nova ficha de inscrição inicial e modelo de cartão físico (número #MC-nnnn, payload QR/NFC, telefone em letra grande).
- Registo de perfil de mobilidade criado no momento da inscrição e associação ao cartão emitido.
- Novo campo de «acompanhamento garantido» na primeira viagem do utente.
- Destino com marcação de «não listado» e fila de validação da coordenação (UC-07).
- Exceção de urgência com justificação, técnico autorizador e data, guardada no registo de auditoria do pedido.
- Registo da leitura do aviso TNUD/Táxi e da decisão do utente.
- Fora de âmbito: o fluxo básico para utente já registado (UC-06-S1); bloqueio por urgência médica aguda, validação de campos obrigatórios e contingência sem meio (UC-06-S3); painel de validação e atribuição da coordenação (UC-07); produção física do cartão.
