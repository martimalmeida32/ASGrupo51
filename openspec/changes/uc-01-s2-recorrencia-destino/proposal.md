# Proposal: UC-01-S2 — Recorrência semanal e destino não listado

## Why
Muitos utentes têm consultas ou tratamentos semanais e destinos que ainda não constam do catálogo de unidades de saúde. Sem recorrência, o familiar teria de repetir manualmente o mesmo pedido todas as semanas; sem destino manual, ficaria impedido de pedir acompanhamento a unidades não catalogadas. Esta slice resolve os dois atritos do fluxo de registo (A1 e A2) mantendo as validações de antecedência (BR-01) e de compatibilidade de mobilidade (BR-02).

## What Changes
- Opção «Repetir semanalmente» no passo da data/hora: cria o pedido original mais quatro ocorrências semanais (total de 5 pedidos) no estado «A escolher o meio», com lembretes.
- Série de pedidos ligados entre si, partilhando destino, hora e perfil de mobilidade, com validação de antecedência mínima de 24 horas (BR-01) e de compatibilidade (BR-02) por ocorrência.
- Registo manual de unidade de saúde não constante do catálogo, aceite como «destino não listado».
- Sinalização dos pedidos com a etiqueta «destino não listado» e colocação numa fila de validação para a coordenação confirmar o destino.
- Extensão da capability `trip-request` criada em UC-01-S1, sem alterar o comportamento dos requisitos UC-01-REQ-01/02 já definidos.

## Capabilities

### New Capabilities
- `trip-request` (extensão de UC-01-S1): acrescenta os requisitos de recorrência semanal e de destino não listado ao registo do pedido de acompanhamento.

### Modified Capabilities
<!-- Sem alterações a specs principais: a capability `trip-request` ainda só existe em changes de UC-01-S1. -->

## Impact
- Novos campos no `TripRequest`: identificador da série, número da ocorrência, indicação de recorrência semanal e indicador/etiqueta «destino não listado» com estado de validação.
- Geração da série (pedido original + 4 semanas seguintes) e agendamento de lembretes semanais.
- Aceitação de destino em texto livre quando não existe no catálogo, mantendo a unidade por validar.
- Fila e ecrã de validação de destinos para a coordenação, com confirmação ou correção do destino.
- Reutilização das validações BR-01/BR-02 e do estado inicial «A escolher o meio» em todas as ocorrências.
- Fora de âmbito: triagem TNUD/Táxi Municipal, encaminhamento telefónico e resiliência offline (UC-01-S3); edição/cancelamento de séries (UC-07); escolha do meio de transporte (UC-02).
