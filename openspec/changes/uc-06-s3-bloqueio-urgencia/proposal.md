# Proposal: UC-06-S3 — Bloqueio de urgência médica e contingência sem meio

## Why
O registo telefónico não pode aceitar pedidos incompletos, pedidos fora do prazo sem justificação, situações de urgência médica aguda que exigem o 112, nem pedidos que ficam sem meio disponível. Sem estes bloqueios e encaminhamentos, o técnico social cria pedidos inválidos ou deixa o utente sem resposta durante a chamada.

## What Changes
- Bloqueio do registo quando faltam campos obrigatórios, com sinalização do campo em falta e sem criar pedido (E1).
- Bloqueio do registo quando a antecedência é inferior a 24 horas e não foi ativada uma exceção, com a mensagem de violação da BR-01 e sem criar pedido (E2, BR-01).
- Bloqueio imediato do registo quando é detetada urgência médica aguda, com alerta destacado para ligar de imediato para o 112 e encerramento do fluxo sem pedido (E3, BR-12).
- Encaminhamento do pedido para a coordenação no UC-07 quando nenhum meio compatível está disponível, terminando sem meio escolhido e com a coordenação notificada (E4, BR-02).

## Capabilities

### New Capabilities
- `telephone-request`: Registo assistido de pedidos por telefone, agora com validação bloqueante de campos e prazo, exclusão de urgências médicas agudas e contingência para a coordenação quando não há meio.

### Modified Capabilities
<!-- Sem alterações a specs principais: o projeto ainda não tem specs principais. -->

## Impact
- Validação bloqueante no assistente de registo telefónico, com erros por campo e sem persistência de pedido.
- Classificação de urgência médica aguda no bloco de necessidades, com alerta destacado e encerramento do fluxo.
- Criação do pedido em estado «Sem opção» e entrega à fila de coordenação (UC-07) quando a cascata não devolve nenhum meio compatível.
- Notificação à coordenação e aviso ao técnico sobre o encaminhamento.
- Registo de auditoria do bloqueio ou encaminhamento, com motivo e técnico.
- Fora de âmbito: fluxo básico para utente registado (UC-06-S1); inscrição inicial, cartão, destino não listado e exceção justificada de urgência (UC-06-S2); atribuição manual e painel da coordenação (UC-07); atendimento pré-hospitalar, que é encaminhado para o 112.
